/*!
 * Module dependencies.
 */

var util = require('util'),
	numeral = require('numeral'),
	utils = require('keystone-utils'),
	super_ = require('../Type');

/**
 * Qiniu FieldType Constructor
 * @extends Field
 * @api public
 */

function qiniu(list, path, options) {
	
	this._nativeType = String;
	this._underscoreMethods = ['format'];
	
	qiniu.super_.call(this, list, path, options);
}

/*!
 * Inherit from Field
 */

util.inherits(qiniu, super_);


/**
 * Formats the field value
 *
 * @api public
 */

qiniu.prototype.format = function(item, format) {
	return item.get(this.path);
};

/**
 * Checks that a valid qiniu has been provided in a data object
 *
 * An empty value clears the stored value and is considered valid
 *
 * @api public
 */

qiniu.prototype.validateInput = function(data, required, item) {
	return true;
};


/**
 * Updates the value for this field in the item from a data object
 *
 * @api public
 */

qiniu.prototype.updateItem = function(item, data) {
	var value = this.getValueFromData(data);
	
	if (value === undefined) {
		return;
	}
	
	item.set(this.path, value);
};


/*!
 * Export class
 */

exports = module.exports = qiniu;
