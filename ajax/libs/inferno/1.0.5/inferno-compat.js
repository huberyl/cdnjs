/*!
 * inferno-compat v1.0.5
 * (c) 2017 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('proptypes'), require('./inferno-component.node'), require('./inferno.node')) :
	typeof define === 'function' && define.amd ? define(['exports', 'proptypes', 'inferno-component', 'inferno'], factory) :
	(factory((global.Inferno = global.Inferno || {}),global.PropTypes,global.Inferno.Component,global.Inferno));
}(this, (function (exports,PropTypes,Component,inferno) { 'use strict';

PropTypes = 'default' in PropTypes ? PropTypes['default'] : PropTypes;
Component = 'default' in Component ? Component['default'] : Component;

// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though

function isStatefulComponent(o) {
    return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
}

function isNullOrUndef$1(obj) {
    return isUndefined(obj) || isNull(obj);
}
function isInvalid(obj) {
    return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
}
function isFunction(obj) {
    return typeof obj === 'function';
}
function isAttrAnEvent(attr) {
    return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
}
function isString(obj) {
    return typeof obj === 'string';
}

function isNull(obj) {
    return obj === null;
}
function isTrue(obj) {
    return obj === true;
}
function isUndefined(obj) {
    return obj === undefined;
}
function isObject(o) {
    return typeof o === 'object';
}

function isValidElement(obj) {
    var isNotANullObject = isObject(obj) && isNull(obj) === false;
    if (isNotANullObject === false) {
        return false;
    }
    var flags = obj.flags;
    return !!(flags & (28 /* Component */ | 3970 /* Element */));
}

// don't autobind these methods since they already have guaranteed context.
var AUTOBIND_BLACKLIST = {
    constructor: 1,
    render: 1,
    shouldComponentUpdate: 1,
    componentWillReceiveProps: 1,
    componentWillUpdate: 1,
    componentDidUpdate: 1,
    componentWillMount: 1,
    componentDidMount: 1,
    componentWillUnmount: 1,
    componentDidUnmount: 1
};
function extend(base, props, all) {
    for (var key in props) {
        if (all === true || !isNullOrUndef$1(props[key])) {
            base[key] = props[key];
        }
    }
    return base;
}
function bindAll(ctx) {
    for (var i in ctx) {
        var v = ctx[i];
        if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST[i]) {
            (ctx[i] = v.bind(ctx)).__bound = true;
        }
    }
}
function collateMixins(mixins, keyed) {
    if ( keyed === void 0 ) keyed = {};

    for (var i = 0; i < mixins.length; i++) {
        var mixin = mixins[i];
        // Surprise: Mixins can have mixins
        if (mixin.mixins) {
            // Recursively collate sub-mixins
            collateMixins(mixin.mixins, keyed);
        }
        for (var key in mixin) {
            if (mixin.hasOwnProperty(key) && typeof mixin[key] === 'function') {
                (keyed[key] || (keyed[key] = [])).push(mixin[key]);
            }
        }
    }
    return keyed;
}
function applyMixin(key, inst, mixin) {
    var original = inst[key];
    inst[key] = function () {
        var arguments$1 = arguments;

        var ret;
        for (var i = 0; i < mixin.length; i++) {
            var method = mixin[i];
            var _ret = method.apply(inst, arguments$1);
            if (!isUndefined(_ret)) {
                ret = _ret;
            }
        }
        if (original) {
            var _ret$1 = original.call(inst);
            if (!isUndefined(_ret$1)) {
                ret = _ret$1;
            }
        }
        return ret;
    };
}
function applyMixins(inst, mixins) {
    for (var key in mixins) {
        if (mixins.hasOwnProperty(key)) {
            var mixin = mixins[key];
            if (isFunction(mixin[0])) {
                applyMixin(key, inst, mixin);
            }
            else {
                inst[key] = mixin;
            }
        }
    }
}
function createClass(obj) {
    var Cl = (function (Component$$1) {
        function Cl(props) {
            Component$$1.call(this, props);
            this.isMounted = function () {
                return !this._unmounted;
            };
            extend(this, obj);
            if (Cl.mixins) {
                applyMixins(this, Cl.mixins);
            }
            bindAll(this);
            if (obj.getInitialState) {
                this.state = obj.getInitialState.call(this);
            }
        }

        if ( Component$$1 ) Cl.__proto__ = Component$$1;
        Cl.prototype = Object.create( Component$$1 && Component$$1.prototype );
        Cl.prototype.constructor = Cl;

        return Cl;
    }(Component));
    Cl.displayName = obj.displayName || 'Component';
    Cl.propTypes = obj.propTypes;
    Cl.defaultProps = obj.getDefaultProps ? obj.getDefaultProps() : undefined;
    Cl.mixins = obj.mixins && collateMixins(obj.mixins);
    if (obj.statics) {
        extend(Cl, obj.statics);
    }
    return Cl;
}

var componentHooks = {
    onComponentWillMount: true,
    onComponentDidMount: true,
    onComponentWillUnmount: true,
    onComponentShouldUpdate: true,
    onComponentWillUpdate: true,
    onComponentDidUpdate: true
};
function createElement$1(name, props) {
    var _children = [], len = arguments.length - 2;
    while ( len-- > 0 ) _children[ len ] = arguments[ len + 2 ];

    if (isInvalid(name) || isObject(name)) {
        throw new Error('Inferno Error: createElement() name parameter cannot be undefined, null, false or true, It must be a string, class or function.');
    }
    var children = _children;
    var ref = null;
    var key = null;
    var events = null;
    var flags = 0;
    if (_children) {
        if (_children.length === 1) {
            children = _children[0];
        }
        else if (_children.length === 0) {
            children = undefined;
        }
    }
    if (isString(name)) {
        flags = 2 /* HtmlElement */;
        switch (name) {
            case 'svg':
                flags = 128 /* SvgElement */;
                break;
            case 'input':
                flags = 512 /* InputElement */;
                break;
            case 'textarea':
                flags = 1024 /* TextareaElement */;
                break;
            case 'select':
                flags = 2048 /* SelectElement */;
                break;
            default:
        }
        for (var prop in props) {
            if (prop === 'key') {
                key = props.key;
                delete props.key;
            }
            else if (prop === 'children' && isUndefined(children)) {
                children = props.children; // always favour children args, default to props
            }
            else if (prop === 'ref') {
                ref = props.ref;
            }
            else if (isAttrAnEvent(prop)) {
                if (!events) {
                    events = {};
                }
                events[prop] = props[prop];
                delete props[prop];
            }
        }
    }
    else {
        flags = isStatefulComponent(name) ? 4 /* ComponentClass */ : 8 /* ComponentFunction */;
        if (!isUndefined(children)) {
            if (!props) {
                props = {};
            }
            props.children = children;
            children = null;
        }
        for (var prop$1 in props) {
            if (componentHooks[prop$1]) {
                if (!ref) {
                    ref = {};
                }
                ref[prop$1] = props[prop$1];
            }
            else if (prop$1 === 'key') {
                key = props.key;
                delete props.key;
            }
        }
    }
    return inferno.createVNode(flags, name, props, children, events, key, ref);
}

inferno.options.findDOMNodeEnabled = true;

function unmountComponentAtNode(container) {
	inferno.render(null, container);
	return true;
}

function isNullOrUndef(children) {
	return children === null || children === undefined;
}

var ARR = [];

var Children = {
	map: function map(children, fn, ctx) {
		if (isNullOrUndef(children)) {return children;}
		children = Children.toArray(children);
		if (ctx && ctx !== children) {fn = fn.bind(ctx);}
		return children.map(fn);
	},
	forEach: function forEach(children, fn, ctx) {
		if (isNullOrUndef(children)) {return children;}
		children = Children.toArray(children);
		if (ctx && ctx !== children) {fn = fn.bind(ctx);}
		children.forEach(fn);
	},
	count: function count(children) {
		children = Children.toArray(children);
		return children.length;
	},
	only: function only(children) {
		children = Children.toArray(children);
		if (children.length !== 1) {throw new Error('Children.only() expects only one child.');}
		return children[0];
	},
	toArray: function toArray(children) {
		if (isNullOrUndef(children)) {return [];}
		return Array.isArray && Array.isArray(children) ? children : ARR.concat(children);
	}
};

var currentComponent = null;

Component.prototype.isReactComponent = {};
inferno.options.beforeRender = function (component) {
	currentComponent = component;
};
inferno.options.afterRender = function () {
	currentComponent = null;
};

var version = '15.4.1';

function normalizeProps(name, props) {
	if ((name === 'input' || name === 'textarea') && props.onChange) {
		var eventName = props.type === 'checkbox' ? 'onclick' : 'oninput';

		if (!props[eventName]) {
			props[eventName] = props.onChange;
			delete props.onChange;
		}
	}
}

// we need to add persist() to Event (as React has it for synthetic events)
// this is a hack and we really shouldn't be modifying a global object this way,
// but there isn't a performant way of doing this apart from trying to proxy
// every prop event that starts with "on", i.e. onClick or onKeyPress
// but in reality devs use onSomething for many things, not only for
// input events
if (typeof Event !== 'undefined' && !Event.prototype.persist) {
	Event.prototype.persist = function () {};
}

var injectStringRefs = function (originalFunction) {
	return function (name, _props) {
		var children = [], len = arguments.length - 2;
		while ( len-- > 0 ) children[ len ] = arguments[ len + 2 ];

		var props = _props || {};
		var ref = props.ref;

		if (typeof ref === 'string') {
			props.ref = function (val) {
				if (this && this.refs) {
					this.refs[ref] = val;
				}
			}.bind(currentComponent || null);
		}
		if (typeof name === 'string') {
			normalizeProps(name, props);
		}
		return originalFunction.apply(void 0, [ name, props ].concat( children ));
	};
};

var createElement = injectStringRefs(createElement$1);
var cloneElement = injectStringRefs(inferno.cloneVNode);

var oldCreateVNode = inferno.options.createVNode;

inferno.options.createVNode = function (vNode) {
	var children = vNode.children;
	var props = vNode.props;

	if (isNullOrUndef(vNode.props)) {
		props = vNode.props = {};
	}
	if (!isNullOrUndef(children) && isNullOrUndef(props.children)) {
		props.children = children;
	}
	if (oldCreateVNode) {
		oldCreateVNode(vNode);
	}
};

// Credit: preact-compat - https://github.com/developit/preact-compat :)
function shallowDiffers(a, b) {
	for (var i in a) {if (!(i in b)) {return true;}}
	for (var i$1 in b) {if (a[i$1] !== b[i$1]) {return true;}}
	return false;
}

function PureComponent(props, context) {
	Component.call(this, props, context);
}

PureComponent.prototype = new Component({}, {});
PureComponent.prototype.shouldComponentUpdate = function (props, state) {
	return shallowDiffers(this.props, props) || shallowDiffers(this.state, state);
};

var WrapperComponent = (function (Component$$1) {
	function WrapperComponent () {
		Component$$1.apply(this, arguments);
	}

	if ( Component$$1 ) WrapperComponent.__proto__ = Component$$1;
	WrapperComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
	WrapperComponent.prototype.constructor = WrapperComponent;

	WrapperComponent.prototype.getChildContext = function getChildContext () {
		return this.props.context;
	};
	WrapperComponent.prototype.render = function render$$1 (props) {
		return props.children;
	};

	return WrapperComponent;
}(Component));

function unstable_renderSubtreeIntoContainer(parentComponent, vNode, container, callback) {
	var wrapperVNode = inferno.createVNode(4, WrapperComponent, { context: parentComponent.context, children: vNode });
	var component = inferno.render(wrapperVNode, container);

	if (callback) {
		callback(component);
	}
	return component;
}

var index = {
	createVNode: inferno.createVNode,
	render: inferno.render,
	isValidElement: isValidElement,
	createElement: createElement,
	Component: Component,
	PureComponent: PureComponent,
	unmountComponentAtNode: unmountComponentAtNode,
	cloneElement: cloneElement,
	PropTypes: PropTypes,
	createClass: createClass,
	findDOMNode: inferno.findDOMNode,
	Children: Children,
	cloneVNode: inferno.cloneVNode,
	NO_OP: inferno.NO_OP,
	version: version,
	unstable_renderSubtreeIntoContainer: unstable_renderSubtreeIntoContainer
};

exports.createVNode = inferno.createVNode;
exports.render = inferno.render;
exports.isValidElement = isValidElement;
exports.createElement = createElement;
exports.Component = Component;
exports.PureComponent = PureComponent;
exports.unmountComponentAtNode = unmountComponentAtNode;
exports.cloneElement = cloneElement;
exports.PropTypes = PropTypes;
exports.createClass = createClass;
exports.findDOMNode = inferno.findDOMNode;
exports.Children = Children;
exports.cloneVNode = inferno.cloneVNode;
exports.NO_OP = inferno.NO_OP;
exports.version = version;
exports.unstable_renderSubtreeIntoContainer = unstable_renderSubtreeIntoContainer;
exports['default'] = index;

Object.defineProperty(exports, '__esModule', { value: true });

})));
