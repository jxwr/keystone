var React = require('react'),
Field = require('../Field'),
url = require('url'),
path = require('path'),
crypto = require('crypto');

var uploadUrl = "http://up.qiniu.com";
var ACCESS_KEY = "hprrplB41Dl6aZnJEmdx-yiVuN9nLR_JfUB96Qs0";
var SECRET_KEY = "sy-cjPnljpMGyMObG4VACQhBNwUWawQxB5Zn736R";

function Mac(accessKey, secretKey) {
  this.accessKey = accessKey
  this.secretKey = secretKey
}

function PutPolicy(scope, callbackUrl, callbackBody, returnUrl, returnBody,
                   asyncOps, endUser, expires, persistentOps, persistentNotifyUrl) {
  this.scope = scope || null;
  this.callbackUrl = callbackUrl || null;
  this.callbackBody = callbackBody || null;
  this.returnUrl = returnUrl || null;
  this.returnBody = returnBody || null;
  this.endUser = endUser || null;
  this.expires = expires || 3600;
  this.persistentOps = persistentOps || null;
  this.persistentNotifyUrl = persistentNotifyUrl || null;
}

PutPolicy.prototype.getFlags = function(putPolicy) {
  var flags = {};
  if (this.scope != null) {
    flags['scope'] = this.scope;
  }
  if (this.callbackUrl != null) {
    flags['callbackUrl'] = this.callbackUrl;
  }
  if (this.callbackBody != null) {
    flags['callbackBody'] = this.callbackBody;
  }
  if (this.returnUrl != null) {
    flags['returnUrl'] = this.returnUrl;
  }
  if (this.returnBody != null) {
    flags['returnBody'] = this.returnBody;
  }
  if (this.endUser != null) {
    flags['endUser'] = this.endUser;
  }
  if (this.persistentOps != null) {
    flags['persistentOps'] = this.persistentOps;
  }
  if (this.persistentNotifyUrl != null) {
    flags['persistentNotifyUrl'] = this.persistentNotifyUrl;
  }
  if (this.persistentPipeline != null) {
    flags['persistentPipeline'] = this.persistentPipeline;
  }
  if (this.mimeLimit != null) {
    flags['mimeLimit'] = this.mimeLimit;
  }
  if (this.insertOnly != null) {
    flags['insertOnly'] = this.insertOnly;
  }
  if (this.detectMime != null) {
    flags['detectMime'] = this.detectMime;
  }
  if (this.saveKey != null) {
    flags['saveKey'] = this.saveKey;
  }
  flags['deadline'] = this.expires + Math.floor(Date.now() / 1000);
  if (this.fsizeLimit != null) {
    flags['fsizeLimit'] = this.fsizeLimit;
  }
  if (this.insertOnly != null) {
    flags['insertOnly'] = this.insertOnly;
  }
  return flags;
}

urlsafeBase64Encode = function(jsonFlags) {
  var encoded = new Buffer(jsonFlags).toString('base64');
  return base64ToUrlSafe(encoded);
}

base64ToUrlSafe = function(v) {
  return v.replace(/\//g, '_').replace(/\+/g, '-');
}

hmacSha1 = function(encodedFlags, secretKey) {
  var hmac = crypto.createHmac('sha1', secretKey);
  hmac.update(encodedFlags);
  return hmac.digest('base64');
}

PutPolicy.prototype.token = function(mac) {
  if (mac == null) {
    mac = new Mac(ACCESS_KEY, SECRET_KEY);
  }
  var flags = this.getFlags();
  var encodedFlags = urlsafeBase64Encode(JSON.stringify(flags));
  var encoded = hmacSha1(encodedFlags, mac.secretKey);
  var encodedSign = base64ToUrlSafe(encoded);
  var uploadToken = mac.accessKey + ':' + encodedSign + ':' + encodedFlags;
  return uploadToken;
}

function uptoken() {
  var putPolicy = new PutPolicy('wtb-photo');
  return putPolicy.token();
}

/* main */

var token = uptoken();
var upload = function(f, token, fn) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', uploadUrl, true);
  var formData, startDate;
  formData = new FormData();
  formData.append('token', token);
  formData.append('file', f);
  var taking;
  xhr.onreadystatechange = function(response) {
    if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
      var blkRet = JSON.parse(xhr.responseText);
      fn(blkRet);
    } else if (xhr.status != 200 && xhr.responseText) {
      console.log("upload failed", xhr.responseText);
    }
  };
  startDate = new Date().getTime();
  xhr.send(formData);
};


module.exports = Field.create({
	
	valueChanged: function(event) {
		var newValue = event.target.value;
		this.props.onChange({
			path: this.props.path,
			value: newValue
		});
	},

  imgurl: function() {
    return 'http://7u2iz3.com1.z0.glb.clouddn.com/'+this.props.value;
  },
	
	renderField: function() {
    var name = this.props.path;
    var img = <img id={'img-'+name} style={{maxWidth:'400px',display:'none'}} />;

    if (this.props.value && this.props.value != "") {
      img = <img id={'img-'+name} style={{maxWidth:'400px'}} src={this.imgurl()} />;
    }

		return <div>
      {img}
      <input type="hidden" id={'text-'+name} name={name} ref="focusTarget" value={this.props.value} onChange={this.valueChanged} autoComplete="off" className="form-control" />
      <input id="token" name="token" value={token} type="hidden" />
      <input id={'file-'+name} name="file" type="file"/>
      <button onClick={this.onUpload} class="qiniu-upload" name={name}>{'上传'+name}</button>
      </div>;
	},

  onUpload: function(e) {
    e.preventDefault();

    var that = this;
    var name = this.props.path;

    upload($('#file-'+name)[0].files[0], token, function(ret){
      console.log('key',ret.key);
      that.props.value = ret.key;
      $('#text-'+name).val(ret.key);
      $('#img-'+name).attr('src',that.imgurl());
      $('#img-'+name).show();
      that.render();
    });
  }
	
});
