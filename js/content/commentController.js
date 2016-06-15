function CommentController() {
    var comment2NodeList = [];

    this.getBodyMarkUp = function (commentId) {
        var COMMENT_MARK_UP = "<div class='commentWrapper'><div class='commentContainer'><textarea name='' id='value" + commentId + "'  ></textarea></div></div>";
        return COMMENT_MARK_UP;
    };

    this.getEntity2NodesList = function () {
        return comment2NodeList;
    }

    this.getCommentOffsetTop = function () {
        return 136;
    }

    this.getCommentOffsetLeft = function () {
        return 0;
    }

    this.renderComment = function (comment, isOwner) {
        this.renderEntity(comment, isOwner);
    }

    this.persistEntity = function (comment) {
        comment.text = $("#value" + comment.tempId).value;
        Bookmark.addComment(comment);
    }

    this.removeEntityFromPersistanceStore = function (commentId) {
        Bookmark.removeCommentById(commentId);
    }

    this.initializeEntity = function (entity) {
        if(entity.text) {
            $("#value" + entity.id).val(entity.text);
        }

        $("#value" + entity.id).on("blur", function () {
            Bookmark.updateCommentText(entity.id, event.target.value);
        });
    }
    
    this.reconcileInnerHtml = function (newEntity, container) {
        $(container).find("textarea").attr("id", "value" + newEntity.id);
    }

    this.updateEntityAtPersistStore = function (newComment) {
        Bookmark.updateCommentId(newComment);
    }
}

CommentController.prototype = commentProto;
