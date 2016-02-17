var BOOKMARK_URL = "/bookmarks",
    BOOKMARK_RIGHTS_URL= "/bookmark/share",
    BOOKMARK_KEY = "bookmarks",
    BOOKMARK_RIGHTS_KEY = "bookmark_rights";

bookmarkService = {
    save: function (bookmarkData) {
        preferencesService.get().then(function (preferences) {
            return baseCachedAccessPoint.set(BOOKMARK_KEY, BOOKMARK_URL, preferences[preferencesService.REFRESH_PERIOD].value, bookmarkData);
        }).then(function (success) {
            chrome.tabs.query({active: true}, function (tabs) {
                var tab = tabs[0];
                chrome.tabs.sendMessage(tab.id, MESSAGE_TYPES.SAVE_SUCCESS);
            }).catch(function () {
                chrome.tabs.sendMessage(tab.id, MESSAGE_TYPES.SAVE_FAIL);
            });
        });
    },

    get: function () {
        return preferencesService.get().then(function (preferences) {
           return baseCachedAccessPoint.get(BOOKMARK_KEY, BOOKMARK_KEY, preferences[preferencesService.REFRESH_PERIOD].value);
        });
    },

    getRights: function () {
        return preferencesService.get().then(function (preferences) {
            return baseCachedAccessPoint.get(BOOKMARK_RIGHTS_KEY, BOOKMARK_RIGHTS_URL, preferences[preferencesService.REFRESH_PERIOD].value);
        });
    },

    setRights: function (bookmarkRights) {
        return preferencesService.get().then(function (preferences) {
            return baseCachedAccessPoint.set(BOOKMARK_RIGHTS_KEY, BOOKMARK_RIGHTS_URL, preferences[preferencesService.REFRESH_PERIOD].value, bookmarkRights);
        });
    }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    'use strict'
    if(message.type !== "GET_BOOKMARK_FOR_URL") {
        return;
    }

    bookmarkService.get().then(function (bookmarks) {
        var bookmark = bookmarks.find(function (bookmark) {
            return bookmark.url == message.url;
        });
        sendResponse(bookmark);
    }).catch(function (e) {
        sendResponse({error:  e});
    });
    return true;
});