// Originally derived from example code from Appcelerator developer relations.
$.windowStack = [];

// Method: open Add a new window to the Navigation Group
// @param windowToOpen {TiUIWindow} Window to open within the nav group.
// @param [options] {openWindowParams} Options to apply while opening. See http://docs.appcelerator.com/titanium/latest/#!/api/openWindowParams.
exports.open = function (windowToOpen, options) {
    // Add the window to the stack of windows managed by the controller
    $.windowStack.push(windowToOpen);

    // When the window closes pop it from the stack.
    windowToOpen.addEventListener('close', function (e) {
        if ($.top === e.source)
            $.windowStack.pop();
        $.trigger('close', e);
    });
    
    if (OS_ANDROID) {
        // Have the back button perform the back method.
        windowToOpen.addEventListener('android:back', function (e) {
            // We override so that the close event is handled properly.
            $.back();
        });
    }
    
    // Propagate the open event.
    windowToOpen.addEventListener('open', function (e) {
        $.trigger('open', e);
    });
    
    // Hack - setting this property ensures the window is "heavyweight" (associated with an Android activity)
    windowToOpen.navBarHidden = windowToOpen.navBarHidden || false;

    if (OS_IOS) {
        if ($.windowStack.length === 1) {
            $.navGroup = Ti.UI.iPhone.createNavigationGroup({
                window : windowToOpen,
                options: options
            });
            $.parent.add($.navGroup);
        } else {
            $.navGroup.open(windowToOpen, options);                
        }
    } else if (OS_ANDROID) {
        if ($.windowStack.length === 1)
            windowToOpen.exitOnClose = true;
        windowToOpen.open(options);
    }
}

// Method: back Close the topmost window in the Navigation Group
// @param [options] {Ti.UI.Animation} Animation dictionary or animation to apply when closing the window. See http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.UI.Animation.
// @returns {boolean} true if there was a window to close and false if the home or first window has been reached.
exports.back = function (options) {
    if ($.windowStack.length > 1) {
        if (OS_IOS) {
            $.navGroup.close($.top, options);
        } else if (OS_ANDROID) {
            $.top.close(options);
        } 
        return true;
    }
    return false;
}

// Method: home Go back to the first window of the NavigationController
// @param [options] {Ti.UI.Animation} Animation dictionary or animation to apply when closing the windows. See http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.UI.Animation.
exports.home = function (options) {
    if ($.windowStack.length > 1) {
        // Because we're closing windows on the stack as we traverse it,
        // it's possible that close events might pop windows off the stack,
        // so we make a copy to manipulate.
        var stack = $.windowStack.slice(0);
        for (var i = stack.length - 1; i > 0; i--) {
            if (OS_IOS) {
                $.navGroup.close(stack[i], options);
            } else if (OS_ANDROID) {
                stack[i].close(options);
            }
        }
    }
}

// Property: top Returns the window at the top of the stack.   
Object.defineProperty($, "top", {
    get: function() { 
        return _.last($.windowStack); 
    }
});

// Property: length Returns the number of windows on the stack.   
Object.defineProperty($, "length", {
    get: function() { 
        return $.windowStack.length; 
    }
});
