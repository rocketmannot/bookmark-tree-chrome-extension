var MESSAGE_IMAGE = "/images/icon128.png";
var shownNotifications = [];

function updateNotificationsBadge(intervalObj, oldRefreshPeriod) {
    return preferencesService.get().then(function (freshPreferences) {
        if(!freshPreferences[preferencesService.NOTIFICATIONS_ENABLED].value || !freshPreferences[preferencesService.EXTENSION_ENABLED].value) {
            return;
        }
        var newRefreshPeriod = freshPreferences[preferencesService.REFRESH_PERIOD].value;
        console.log(newRefreshPeriod);
        if(oldRefreshPeriod != newRefreshPeriod) {
            clearInterval(intervalObj.intervalId);
            var newIntevalObj = {};
            newIntevalObj.intervalId = setInterval(function (){updateNotificationsBadge(newIntevalObj, newRefreshPeriod)}, newRefreshPeriod * 1000 * 60);
        }
        console.log("creating notification");

        bookmarkService.get().catch(function (e) {
            console.error("can not update bookmarks list " + JSON.stringify(e));
        });

        notificationsService.getNotifications().then(function (notifications) {
            notifications.forEach(function (notification) {
                if(shownNotifications.indexOf(notification.id) != -1) {
                    return;
                }
                shownNotifications.push(notification.id);
                chrome.notifications.create(String(new Date()),
                    {title: "Bookmark tree notification", type: "basic", message: notification.message, iconUrl: MESSAGE_IMAGE})
            });

        }, function (e) {
            console.error("cannot set notifications badge " + JSON.stringify(e));
        });
    });

}

function updateExtensionBadge(text) {
    chrome.browserAction.setBadgeText({text: text.toString()});
}

(function () {
    preferencesService.get().then(function (preferences) {
        var intervalObj = {};
        intervalObj.intervalId = setInterval(function () {
            updateNotificationsBadge(intervalObj, preferences[preferencesService.REFRESH_PERIOD].value)
        }, preferences[preferencesService.REFRESH_PERIOD].value * 1000 * 60);
    }, function (e) {console.error("can not set notifications count badge error: " + JSON.stringify(e));});
}) ();

chrome.contextMenus.create({"title": "Mark Text", "contexts":["selection"],
    "onclick": function() {
        getActiveTab(function (tab) {
            chrome.tabs.sendMessage(tab[0].id, {type: MESSAGE_TYPES.MARK_SELECTION});
        })
}});

chrome.contextMenus.create({"title": "Create comment", "contexts":["selection"],
    "onclick": function() {
        getActiveTab(function (tab) {
            chrome.tabs.sendMessage(tab[0].id, {type: MESSAGE_TYPES.COMMENT_SELECTION});
        })
}});

chrome.contextMenus.create({"title": "Create link", "contexts":["selection"],
    "onclick": function() {
        getActiveTab(function (tab) {
            chrome.tabs.sendMessage(tab[0].id, {type: MESSAGE_TYPES.BOOKMARK_TREE_BUILDER_SELECTION});
        })
}});


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    if(message.type !== "SET_BADGE") {
        return;
    }

    updateExtensionBadge(message.text);

    return true;
});

// add listeners to tab changes
chrome.tabs.onActivated.addListener(function(activeInfo) {
    return new Promise (function (resolve, reject) {
            chrome.tabs.sendMessage(activeInfo.tabId, {type: "GET_BOOKMARK"}, null, function (bookmark) {
                var text = bookmarkService.getAllEntitiesCount(bookmark);
                text = bookmark && bookmark.persisted && text == 0 ? "+" : text;
                updateExtensionBadge(text);
            });
    });
});
