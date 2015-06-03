var remote = require('remote');
var fs = require('fs');
var $ = require('jquery');
var Mustache = require('mustache');
var profile = require('./profile.js');
var editor = require('./editor.js');
var ace = require('./ace/ace.js');

var template = fs.readFileSync('www/templates/profile.html').toString();

$(document).on('dblclick mousedown', '.no-select, .btn', false);

var toggleMenu = function($profile) {
  $profile.find('.menu').toggleClass('show');
  $profile.find('.menu-backdrop').fadeToggle(75);
};

var openEditor = function($profile, $editor, data, typ) {
  var edtr = new editor.Editor($editor);
  edtr.create();
  edtr.set(data);

  $profile.addClass('editing-' + typ);
  setTimeout(function() {
    toggleMenu($profile);
  }, 55);

  return edtr;
};
var closeEditor = function($profile, $editor, typ) {
  $profile.removeClass('editing-' + typ);
  setTimeout(function() {
    setTimeout(function() {
      $editor.empty();
      $editor.attr('class', 'editor');
    }, 55);
  }, 130);
};

var openConfig = function(prfl, $profile) {
  var $editor = $profile.find('.config .editor');
  return openEditor($profile, $editor, prfl.data, 'config');
};
var closeConfig = function($profile) {
  var $editor = $profile.find('.config .editor');
  return closeEditor($profile, $editor, 'config');
};

var openLog = function(prfl, $profile) {
  var $editor = $profile.find('.logs .editor');
  return openEditor($profile, $editor, prfl.log, 'logs');
};
var closeLog = function($profile) {
  var $editor = $profile.find('.logs .editor');
  return closeEditor($profile, $editor, 'logs');
};

var renderProfile = function(prfl) {
  var edtr;
  var $profile = $(Mustache.render(template, prfl.export()));

  $profile.find('.open-menu i, .menu-backdrop').click(function(evt) {
    if (!$profile.hasClass('profile')) {
      $profile = $profile.parent();
    }
    toggleMenu($profile);
  });

  $profile.find('.menu .connect').click(function() {
    prfl.connect();
  });

  $profile.find('.menu .edit-config').click(function() {
    edtr = openConfig(prfl, $profile);
  });

  $profile.find('.menu .view-logs').click(function() {
    edtr = openLog(prfl, $profile);
  });

  $profile.find('.config .btns .save').click(function() {
    if (!edtr) {
      return;
    }
    prfl.data = edtr.get();
    edtr.destroy();
    edtr = null;

    prfl.saveData(function(err) {
      // TODO err
      closeConfig($profile);
    });
  });

  $profile.find('.config .btns .cancel').click(function() {
    if (!edtr) {
      return;
    }
    edtr.destroy();
    edtr = null;

    closeConfig($profile);
  });

  $profile.find('.logs .btns .close').click(function() {
    if (!edtr) {
      return;
    }
    edtr.destroy();
    edtr = null;

    closeLog($profile);
  });

  $profile.find('.logs .btns .clear').click(function() {
    if (!edtr) {
      return;
    }
    edtr.set('');
    prfl.log = '';
    prfl.saveLog(function(err) {
      // TODO err
    });
  });

  $('.profiles .list').append($profile);
};

var renderProfiles = function() {
  profile.getProfiles(function(err, profiles) {
    for (var i = 0; i < profiles.length; i++) {
      renderProfile(profiles[i]);
    }
  });
};

renderProfiles();