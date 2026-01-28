var TkDomPosition = {};
(function () {
    TkDomPosition.getAbsolute = function (reference, target) {
        //因为我们会将目标元素的边框纳入递归公式中，这里先减去对应的值
        var result = {
            left: -target.clientLeft,
            top: -target.clientTop
        }
        var node = target;
        while(node != reference && node != document){
            result.left = result.left + node.offsetLeft + node.clientLeft;
            result.top = result.top + node.offsetTop + node.clientTop;
            node = node.parentNode;
        }
        if(isNaN(reference.scrollLeft)){
            result.right = document.documentElement.scrollWidth - result.left;
            result.bottom = document.documentElement.scrollHeight - result.top;
        }else {
            result.right = reference.scrollWidth - result.left;
            result.bottom = reference.scrollHeight - result.top;
        }
        return result;
    }
    TkDomPosition.getViewport = function (target) {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
        var windowHeight = window.innerHeight || document.documentElement.offsetHeight;
        var windowWidth = window.innerWidth || document.documentElement.offsetWidth;
        var absolutePosi = this.getAbsolute(document, target);
        var Viewport = {
            left: absolutePosi.left - scrollLeft,
            top: absolutePosi.top - scrollTop,
            right: windowWidth - (absolutePosi.left - scrollLeft),
            bottom: windowHeight - (absolutePosi.top - scrollTop),
            rect:target.getBoundingClientRect()
        }

        return Viewport;
    }
    TkDomPosition.isViewport = function (target) {
        var TkDomPosition = this.getViewport(target);
        //这里需要加上元素自身的宽高，因为定位点是元素的左上角
        if(TkDomPosition.left + target.offsetWidth < 0 || TkDomPosition.top + target.offsetHeight < 0){
            return false;
        }
        if(TkDomPosition.bottom < 0 || TkDomPosition.right < 0){
            return false;
        }
        return true;
    }
})();