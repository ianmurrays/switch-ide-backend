(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"application": function(exports, require, module) {
  var Application, CodeEditor, ContextualFileMenu, Filebrowser, Logger, Navbar, Projects, Router, ViewEditor;

  Router = require('routers/router');

  Navbar = require('views/navbar_view');

  Filebrowser = require('views/filebrowser_view');

  CodeEditor = require('views/code_editor_view');

  ViewEditor = require('views/view_editor_view');

  Projects = require('models/projects');

  ContextualFileMenu = require('views/contextual_file_menu_view');

  Logger = require('logger');

  module.exports = Application = (function() {

    Application.prototype.baseUrl = '/api/v1';

    function Application() {
      var _this = this;
      $(function() {
        _this.initialize();
        return Backbone.history.start({
          pushState: false
        });
      });
    }

    Application.prototype.initialize = function() {
      var _this = this;
      this.router = new Router;
      this.logger = new Logger;
      this.logger.logging = true;
      this.contextualFileMenu = new ContextualFileMenu;
      this.renderEssentialComponents();
      this.setupShortcuts();
      $(window).resize(function() {
        return _this.resizeComponents();
      });
      return $('body').live('click', function() {
        return _this.contextualFileMenu.hide();
      });
    };

    Application.prototype.setupShortcuts = function() {};

    Application.prototype.renderEssentialComponents = function() {
      var navbar;
      navbar = new Navbar();
      $('header').html(navbar.render().el);
      this.filebrowser = new Filebrowser();
      $('#filebrowser').html(this.filebrowser.render().el);
      this.code_editor = new CodeEditor();
      $('#center_container').html(this.code_editor.render().el);
      this.view_editor = new ViewEditor();
      $('#center_container').append(this.view_editor.render().el);
      this.view_editor.hide();
      return this.resizeComponents();
    };

    Application.prototype.editor = function() {
      if (this.code_editor.active) {
        return this.code_editor;
      } else if (this.view_editor.active) {
        return this.view_editor;
      }
    };

    Application.prototype.resizeComponents = function() {
      var filebrowser_width, view_editor_width;
      filebrowser_width = $('#filebrowser').width();
      $('#filebrowser').height($(window).height() - 40);
      $('#filebrowser').css('top', 40);
      $('.code-editor, .CodeMirror-scroll').height($(window).height() - 40);
      $('.code-editor').width($(window).width() - filebrowser_width - 5);
      $('.code-editor').css('top', 40);
      view_editor_width = $(window).width() - filebrowser_width - 5;
      $('.view-editor').height($(window).height() - 40);
      $('.view-editor').width(view_editor_width);
      $('.view-editor #view_container').width(view_editor_width - filebrowser_width - 15);
      $('.view-editor #view_container').height($(window).height() - 40 - 45);
      $('.view-editor #view_editor_header').width(view_editor_width - filebrowser_width - 5);
      $('.view-editor').css('top', 45);
      $('.view-editor #code_container, .view-editor #code_container .CodeMirror-scroll').height($(window).height() - 40 - 45);
      return $('.view-editor #code_container').width($(window).width() - filebrowser_width * 2 - 5);
    };

    return Application;

  })();

  window.app = new Application;
  
}});

window.require.define({"logger": function(exports, require, module) {
  var Logger;

  module.exports = Logger = (function() {

    function Logger() {}

    Logger.prototype.logging = false;

    Logger.prototype.log = function() {
      var args;
      if (this.logging) {
        args = _.map(arguments, function(arg) {
          return arg;
        });
        return console.log("[SwitchIDE] " + args.join(" "));
      }
    };

    return Logger;

  })();
  
}});

window.require.define({"models/collection": function(exports, require, module) {
  var Collection,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = Collection = (function(_super) {

    __extends(Collection, _super);

    function Collection() {
      return Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.url = function() {
      return "" + app.baseUrl + "/" + this.apiPath;
    };

    Collection.prototype.model = require('./model');

    return Collection;

  })(Backbone.Collection);
  
}});

window.require.define({"models/file": function(exports, require, module) {
  var File, Model,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require('./model');

  module.exports = File = (function(_super) {

    __extends(File, _super);

    function File() {
      return File.__super__.constructor.apply(this, arguments);
    }

    File.prototype.isDirectory = function() {
      return this.get('type') === 'directory';
    };

    File.prototype.isView = function() {
      return this.get('name').match(/\.mustache$/);
    };

    File.prototype.codeMode = function() {
      if (this.get('name')) {
        if (this.get('name').match(/\.coffee$/)) {
          return "coffeescript";
        } else if (this.get('name').match(/\.js$/)) {
          return "javascript";
        } else if (this.get('name').match(/\.json/)) {
          return {
            name: "javascript",
            json: true
          };
        } else if (this.get('name').match(/\.s?css$/)) {
          return "css";
        } else if (this.get('name').match(/\.(md|markdown|mdown)$/)) {
          return "markdown";
        } else if (this.get('name').match(/\.html?$/)) {
          return {
            name: "xml",
            htmlMode: true
          };
        } else if (this.get('name').match(/\.mustache$/)) {
          return {
            name: "xml",
            htmlMode: true
          };
        }
      } else {
        return "text";
      }
    };

    File.prototype.fullPath = function() {
      return this.fullPathNamed(this.get('name'));
    };

    File.prototype.fullPathNamed = function(name) {
      return "" + (this.get('parent')) + "/" + name;
    };

    File.prototype.railsPath = function(method, params) {
      var key, path, _i, _len, _ref;
      if (params == null) {
        params = {};
      }
      path = [app.baseUrl, "projects", this.project.get('id'), "files", method].join("/");
      path += "?path=" + ([this.get('parent'), this.get('name')].join("/"));
      _ref = _.keys(params);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        path += "&" + key + "=" + params[key];
      }
      return path;
    };

    File.prototype.fetchContent = function() {
      var _this = this;
      if (this.isDirectory()) {
        return;
      }
      return $.getJSON(this.railsPath('content'), function(data) {
        _this.set('content', data.content, {
          silent: true
        });
        return _this.trigger('change:content');
      });
    };

    File.prototype.updateContent = function(callback) {
      var _this = this;
      if (this.isDirectory()) {
        return;
      }
      Backbone.Mediator.pub("status:set", "Saving " + (this.get('name')) + " ...");
      return $.ajax({
        url: this.railsPath('content'),
        type: 'PUT',
        data: {
          content: this.get('content')
        },
        success: function(data) {
          _this.set('content', data.content, {
            silent: true
          });
          _this.trigger('change:content');
          Backbone.Mediator.pub("status:set", "Saved " + (_this.get('name')));
          return typeof callback === "function" ? callback(data) : void 0;
        }
      });
    };

    File.prototype.rename = function(newName) {
      var _this = this;
      return $.ajax({
        url: this.railsPath('rename', {
          new_path: this.fullPathNamed(newName)
        }),
        type: 'PUT',
        success: function(data) {
          var previous;
          previous = _this.get('name');
          _this.set('name', newName);
          _this.set('isRenaming', false);
          Backbone.Mediator.pub("status:set", "Renamed " + (_this.get('name')));
          return Backbone.Mediator.pub("file:renamed", _this, previous);
        }
      });
    };

    File.prototype["delete"] = function() {
      var _this = this;
      return $.ajax({
        url: this.railsPath('destroy'),
        type: 'DELETE',
        success: function(data) {
          Backbone.Mediator.pub("status:set", "Deleted " + (_this.get('name')));
          return _this.destroy();
        }
      });
    };

    return File;

  })(Model);
  
}});

window.require.define({"models/files": function(exports, require, module) {
  var Collection, File, FilesCollection,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Collection = require('./collection');

  File = require('./file');

  module.exports = FilesCollection = (function(_super) {

    __extends(FilesCollection, _super);

    function FilesCollection() {
      return FilesCollection.__super__.constructor.apply(this, arguments);
    }

    FilesCollection.prototype.model = File;

    FilesCollection.prototype.initialize = function(attr, options) {
      if (options) {
        this.path = options.path;
        this.project = options.project;
        this.url = [app.baseUrl, "projects", this.project.get('id'), "files"].join("/");
        this.url += "?path=" + this.path;
      }
      this.bind('reset', this.sort, this);
      this.bind('reset', this.applyProjectToFiles, this);
      this.bind('add', this.applyProjectToFile, this);
      return this.bind('add', this.sort, this);
    };

    FilesCollection.prototype.sort = function() {
      var directories, files, grouped;
      grouped = this.groupBy(function(file) {
        return file.get('type');
      });
      if (grouped.directory && grouped.file) {
        directories = _.sortBy(grouped.directory, function(dir) {
          return dir.get('name').toLowerCase();
        });
        files = _.sortBy(grouped.file, function(file) {
          return file.get('name').toLowerCase();
        });
        return this.reset(_.union(directories, files), {
          silent: true
        });
      }
    };

    FilesCollection.prototype.applyProjectToFiles = function() {
      var _this = this;
      return this.each(function(file) {
        return _this.applyProjectToFile(file);
      });
    };

    FilesCollection.prototype.applyProjectToFile = function(file) {
      return file.project = this.project;
    };

    return FilesCollection;

  })(Collection);
  
}});

window.require.define({"models/model": function(exports, require, module) {
  var Model,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = Model = (function(_super) {

    __extends(Model, _super);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.urlRoot = function() {
      return "" + app.baseUrl + "/" + this.apiPath;
    };

    return Model;

  })(Backbone.Model);
  
}});

window.require.define({"models/project": function(exports, require, module) {
  var Files, Model, Project,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require('./model');

  Files = require('./files');

  module.exports = Project = (function(_super) {

    __extends(Project, _super);

    function Project() {
      return Project.__super__.constructor.apply(this, arguments);
    }

    Project.prototype.apiPath = 'projects';

    Project.prototype.toJSON = function() {
      return {
        "project": _.pick(_.clone(this.attributes), 'name')
      };
    };

    Project.prototype.initialize = function() {
      return this.rootFolder = new Files;
    };

    Project.prototype.create = function(callback) {
      var _this = this;
      return $.ajax({
        url: [app.baseUrl, "projects"].join("/"),
        type: "POST",
        data: {
          name: this.get('name')
        },
        success: function(data) {
          _this.set('id', data.id);
          _this.set('path', data.path);
          return typeof callback === "function" ? callback() : void 0;
        }
      });
    };

    Project.prototype.fetchRootFolder = function(callback) {
      if (this.get('id')) {
        this.rootFolder = new Files(null, {
          path: "/",
          project: this
        });
        return this.rootFolder.fetch({
          success: function() {
            return typeof callback === "function" ? callback() : void 0;
          }
        });
      }
    };

    Project.prototype.railsPath = function(method) {
      var path;
      return path = [app.baseUrl, "projects", this.get('id'), method].join("/");
    };

    Project.prototype.newFile = function(options) {
      var collection, fileView, name, parent, parentDirectory, type,
        _this = this;
      parent = options.model;
      fileView = options.fileView;
      name = options.name;
      type = options.type;
      if (parent.isDirectory()) {
        parentDirectory = parent.fullPath();
        collection = fileView.directory;
      } else {
        parentDirectory = parent.get('parent');
        collection = parent.collection;
      }
      console.log(collection);
      return $.ajax({
        url: this.railsPath("files/new") + ("?path=" + parentDirectory),
        data: {
          name: name,
          type: type
        },
        type: "POST",
        success: function(response) {
          if (response.result === "exists") {
            return bootbox.alert("A file or folder named " + name + " already exists in that path");
          } else {
            if (collection) {
              return collection.add(response.data);
            }
          }
        }
      });
    };

    Project.prototype.runProject = function(callback) {
      Backbone.Mediator.pub("status:set", "Starting server...");
      return $.ajax({
        url: this.railsPath("run"),
        type: "POST",
        success: function(response) {
          if (!response.result) {
            setTimeout(function() {
              return window.open(response.url);
            }, 1500);
            Backbone.Mediator.pub("status:set", "Running", {
              sticky: true
            });
            return typeof callback === "function" ? callback() : void 0;
          } else {
            return Backbone.Mediator.pub("status:set", "Failed to start server");
          }
        }
      });
    };

    Project.prototype.buildAndRun = function() {
      var _this = this;
      return this.buildProject(function() {
        app.logger.log("Now calling attempting to run");
        return _this.runProject();
      });
    };

    Project.prototype.buildProject = function(callback) {
      Backbone.Mediator.pub("status:set", "Building...");
      return $.ajax({
        url: this.railsPath("build"),
        type: "POST",
        success: function(response) {
          var modal;
          if (response.result) {
            Backbone.Mediator.pub("status:set", "Build failed");
            modal = "<div class=\"modal hide fade\" id=\"myModal\">\n  <div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n    <h3 class=\"build-error\">Build Failed</h3>\n  </div>\n  <div class=\"modal-body\">\n    <p>Build failed. Here's the output of the build process:</p>\n    <pre style=\"overflow: auto;\">" + response.output + "</pre>\n  </div>\n  <div class=\"modal-footer\">\n    <a href=\"javascript:;\" class=\"btn\" data-dismiss=\"modal\">Close</a>\n  </div>\n</div>";
            return $(modal).appendTo('body').modal("show");
          } else {
            Backbone.Mediator.pub("status:set", "Build successful");
            return typeof callback === "function" ? callback() : void 0;
          }
        }
      });
    };

    return Project;

  })(Model);
  
}});

window.require.define({"models/projects": function(exports, require, module) {
  var Collection, Project, ProjectsCollection,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Collection = require('./collection');

  Project = require('./project');

  module.exports = ProjectsCollection = (function(_super) {

    __extends(ProjectsCollection, _super);

    function ProjectsCollection() {
      return ProjectsCollection.__super__.constructor.apply(this, arguments);
    }

    ProjectsCollection.prototype.apiPath = 'projects';

    ProjectsCollection.prototype.model = Project;

    return ProjectsCollection;

  })(Collection);
  
}});

window.require.define({"routers/router": function(exports, require, module) {
  var Project, Projects, ProjectsView, Router,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Project = require('models/project');

  Projects = require('models/projects');

  ProjectsView = require('views/projects_view');

  module.exports = Router = (function(_super) {

    __extends(Router, _super);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.routes = {
      '': 'index',
      'projects/:id': 'project',
      '*all': 'redirect'
    };

    Router.prototype.index = function() {
      var projects, projectsView;
      app.logger.log("Router#index");
      projects = new Projects();
      projectsView = new ProjectsView({
        collection: projects
      });
      $('body').append(projectsView.render().el);
      $("#" + projectsView.id).modal({
        backdrop: 'static',
        keyboard: false
      });
      return projects.fetch();
    };

    Router.prototype.project = function(id) {
      var _this = this;
      app.logger.log("Router#project");
      app.project = new Project({
        id: id
      });
      app.project.fetch({
        success: function() {
          app.filebrowser.setModel(app.project);
          return Backbone.Mediator.pub('status:set', "Project Loaded");
        }
      });
      return Backbone.Mediator.pub('modal:hide');
    };

    Router.prototype.redirect = function() {
      app.logger.log("Router#redirect");
      return this.navigate('');
    };

    return Router;

  })(Backbone.Router);
  
}});

window.require.define({"views/code_editor_view": function(exports, require, module) {
  var CodeEditorView, File,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  File = require('models/file');

  module.exports = CodeEditorView = (function(_super) {

    __extends(CodeEditorView, _super);

    function CodeEditorView() {
      return CodeEditorView.__super__.constructor.apply(this, arguments);
    }

    CodeEditorView.prototype.className = 'code-editor';

    CodeEditorView.prototype.active = false;

    CodeEditorView.prototype.placeholderModel = true;

    CodeEditorView.prototype.initialize = function() {
      var _this = this;
      this.model || (this.model = new File);
      Mousetrap.bind(['ctrl+z', 'command+z'], function(e) {
        e.preventDefault();
        return _this.codemirror.undo();
      });
      return Mousetrap.bind(['ctrl+shift+z', 'command+shift+z'], function(e) {
        e.preventDefault();
        return _this.codemirror.redo();
      });
    };

    CodeEditorView.prototype.updateAndSave = function(callback) {
      if (this.placeholderModel) {
        return false;
      }
      this.model.set('content', this.codemirror.getValue());
      return this.model.updateContent(callback);
    };

    CodeEditorView.prototype.setFile = function(file) {
      if (!this.placeholderModel) {
        localStorage["switch:codemirror:history:" + (app.project.get('id')) + ":" + (this.model.fullPath())] = JSON.stringify(this.codemirror.getHistory());
      }
      this.updateAndSave();
      this.model.off('change:content', this.updateContent, this);
      this.codemirror.clearHistory();
      this.model = file;
      this.model.on('change:content', this.updateContent, this);
      return this.placeholderModel = false;
    };

    CodeEditorView.prototype.clearEditor = function(options) {
      var callback,
        _this = this;
      if (options == null) {
        options = {
          save: true
        };
      }
      this.model.off('change:content', this.updateContent, this);
      callback = function() {
        _this.codemirror.setValue('');
        _this.codemirror.clearHistory();
        _this.model = new File;
        return _this.placeholderModel = true;
      };
      if (options.save) {
        return this.updateAndSave(callback);
      } else {
        return callback();
      }
    };

    CodeEditorView.prototype.updateContent = function() {
      var history;
      this.codemirror.setValue(this.model.get('content'));
      this.codemirror.setOption("mode", this.model.codeMode());
      this.codemirror.clearHistory();
      if (history = localStorage["switch:codemirror:history:" + (app.project.get('id')) + ":" + (this.model.fullPath())]) {
        this.codemirror.setHistory(JSON.parse(history));
      }
      return this.codemirror.focus();
    };

    CodeEditorView.prototype.render = function() {
      var _this = this;
      this.$el.html("");
      this.codemirror = CodeMirror(this.$el[0], {
        value: this.model.get('content'),
        lineNumbers: true,
        tabSize: 2,
        onCursorActivity: function() {
          return _this.codemirror.matchHighlight("CodeMirror-matchhighlight");
        }
      });
      this.$('textarea').addClass("mousetrap");
      return this;
    };

    CodeEditorView.prototype.show = function() {
      var _this = this;
      this.$el.show();
      this.active = true;
      return Mousetrap.bind(['ctrl+s', 'command+s'], function(e) {
        e.preventDefault();
        return _this.updateAndSave();
      });
    };

    CodeEditorView.prototype.hide = function() {
      this.$el.hide();
      this.active = false;
      return Mousetrap.unbind(['ctrl+s', 'command+s']);
    };

    return CodeEditorView;

  })(Backbone.View);
  
}});

window.require.define({"views/contextual_file_menu_view": function(exports, require, module) {
  var ContextualFileMenuView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = ContextualFileMenuView = (function(_super) {

    __extends(ContextualFileMenuView, _super);

    function ContextualFileMenuView() {
      return ContextualFileMenuView.__super__.constructor.apply(this, arguments);
    }

    ContextualFileMenuView.prototype.template = require('./templates/contextual_file_menu');

    ContextualFileMenuView.prototype.tagName = "div";

    ContextualFileMenuView.prototype.className = "dropdown contextual-menu";

    ContextualFileMenuView.prototype.fileView = null;

    ContextualFileMenuView.prototype.events = {
      "click .rename-file": "rename",
      "click .delete-file": "delete",
      "click .new-file": "newFile",
      "click .new-folder": "newFolder"
    };

    ContextualFileMenuView.prototype.initialize = function() {
      this.render();
      return this.$el.appendTo('body');
    };

    ContextualFileMenuView.prototype.show = function(model, fileView, position) {
      this.model = model;
      this.fileView = fileView;
      this.render();
      this.$el.css({
        left: position.x,
        top: position.y
      });
      this.$('.dropdown-menu').show();
      return this.$el.show();
    };

    ContextualFileMenuView.prototype.hide = function() {
      return this.$el.hide();
    };

    ContextualFileMenuView.prototype.render = function() {
      var _ref;
      return this.$el.html(this.template.render({
        allowClose: (_ref = this.fileView) != null ? _ref.allowClose : void 0
      }));
    };

    ContextualFileMenuView.prototype.rename = function() {
      this.hide();
      return this.model.set('isRenaming', true);
    };

    ContextualFileMenuView.prototype["delete"] = function() {
      var _this = this;
      this.hide();
      return bootbox.confirm("Are you sure you want to delete " + (this.model.get('name')) + "? This cannot be undone.", function(result) {
        if (result) {
          return _this.model["delete"]();
        }
      });
    };

    ContextualFileMenuView.prototype.newFile = function() {
      var _this = this;
      this.hide();
      return bootbox.prompt("New File", function(name) {
        if (!(name === null || name === "")) {
          return app.project.newFile({
            model: _this.model,
            fileView: _this.fileView,
            name: name,
            type: "file"
          });
        }
      });
    };

    ContextualFileMenuView.prototype.newFolder = function() {
      var _this = this;
      this.hide();
      return bootbox.prompt("New Folder", function(name) {
        if (!(name === null || name === "")) {
          return app.project.newFile({
            model: _this.model,
            fileView: _this.fileView,
            name: name,
            type: "folder"
          });
        }
      });
    };

    return ContextualFileMenuView;

  })(Backbone.View);
  
}});

window.require.define({"views/file_view": function(exports, require, module) {
  var FileView, Files,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Files = require('models/files');

  module.exports = FileView = (function(_super) {

    __extends(FileView, _super);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.prototype.template = require('./templates/file');

    FileView.prototype.tagName = "div";

    FileView.prototype.className = "file-container";

    FileView.prototype.directory = null;

    FileView.prototype.allowClose = false;

    FileView.prototype.events = function() {
      var events;
      events = {};
      events["contextmenu"] = "contextualMenu";
      events["click a#cid_" + this.model.cid] = "open";
      events["keydown input"] = "rename";
      return events;
    };

    FileView.prototype.initialize = function(attr, options) {
      var _this = this;
      if (options) {
        if (options.allowClose) {
          this.allowClose = options.allowClose;
        }
      }
      this.model.on('all', this.render, this);
      this.model.on('destroy', function() {
        app.code_editor.clearEditor({
          save: false
        });
        return _this.remove();
      });
      Backbone.Mediator.sub("fileview:startedRenaming", this.stopRenaming, this);
      return this.model.on('change:isRenaming', function(model, renaming) {
        if (renaming) {
          return Backbone.Mediator.pub("fileview:startedRenaming", _this);
        }
      });
    };

    FileView.prototype.render = function() {
      var _this = this;
      this.$el.html(this.template.render({
        name: this.model.get('name'),
        cid: this.model.cid,
        isDirectory: this.model.isDirectory(),
        isRenaming: this.model.get('isRenaming'),
        isView: this.model.isView(),
        directory: this.directory,
        allowClose: this.allowClose,
        showForm: this.model.get('isRenaming') && !this.allowClose
      }));
      this.$el.attr('data-cid', this.model.cid);
      if (this.directory) {
        this.directory.each(function(file) {
          var file_view;
          file_view = new FileView({
            model: file
          });
          return _this.$('.subdirectory').first().append(file_view.render().el);
        });
      }
      if (this.model.get('isRenaming')) {
        this.$('input').focus();
      }
      return this;
    };

    FileView.prototype.markAsActive = function() {
      return this.$el.addClass('active');
    };

    FileView.prototype.unmarkAsActive = function() {
      return this.$el.removeClass('active');
    };

    FileView.prototype.removeFromList = function() {
      if (!this.allowClose) {
        return;
      }
      this.remove();
      return Backbone.Mediator.pub("filebrowser:close_file", this.model);
    };

    FileView.prototype.contextualMenu = function(e) {
      e.preventDefault();
      e.stopPropagation();
      return app.contextualFileMenu.show(this.model, this, {
        x: e.pageX,
        y: e.pageY
      });
    };

    FileView.prototype.rename = function(e) {
      if (e.keyCode === 13) {
        this.model.rename(this.$('input').val());
        return this.$('input').attr('disabled', 'disabled');
      } else if (e.keyCode === 27) {
        return this.model.set('isRenaming', false);
      }
    };

    FileView.prototype.stopRenaming = function(model) {
      if (model !== this) {
        return this.model.set('isRenaming', false);
      }
    };

    FileView.prototype.open = function(e) {
      if (e != null) {
        e.preventDefault();
      }
      if (this.model.get('isRenaming')) {
        return;
      }
      if (this.model.isDirectory()) {
        if (this.directory) {
          app.logger.log("Closing directory " + (this.model.get('name')));
          this.directory.off('all');
          this.directory = null;
          return this.render();
        } else {
          app.logger.log("Opening directory " + (this.model.get('name')));
          this.directory = new Files(null, {
            project: this.model.project,
            path: this.model.fullPath()
          });
          this.directory.on('reset', this.render, this);
          this.directory.on('add', this.render, this);
          return this.directory.fetch();
        }
      } else {
        app.logger.log("Opening file " + (this.model.get('name')));
        app.view_editor.hide();
        app.code_editor.hide();
        if (this.model.isView()) {
          app.view_editor.setFile(this.model);
          app.code_editor.updateAndSave();
          app.view_editor.show();
        } else {
          app.code_editor.setFile(this.model);
          app.view_editor.updateAndSave();
          app.code_editor.show();
        }
        this.model.fetchContent();
        return Backbone.Mediator.pub("filebrowser:open_file", this.model);
      }
    };

    return FileView;

  })(Backbone.View);
  
}});

window.require.define({"views/filebrowser_view": function(exports, require, module) {
  var File, FileView, FilebrowserView, Project,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Project = require('models/project');

  FileView = require('./file_view');

  File = require('models/file');

  module.exports = FilebrowserView = (function(_super) {

    __extends(FilebrowserView, _super);

    function FilebrowserView() {
      return FilebrowserView.__super__.constructor.apply(this, arguments);
    }

    FilebrowserView.prototype.className = 'filebrowser';

    FilebrowserView.prototype.template = require('./templates/filebrowser');

    FilebrowserView.prototype.openFiles = {};

    FilebrowserView.prototype.openFile = null;

    FilebrowserView.prototype.arrayOpenFiles = [];

    FilebrowserView.prototype.initialize = function() {
      var _this = this;
      this.setModel(this.model || new Project());
      _.each([1, 2, 3, 4, 5, 6, 7, 8, 9], function(number) {
        return Mousetrap.bind(["ctrl+" + number, "command+" + number], function(e) {
          e.preventDefault();
          return _this.openFileAtIndex(number - 1);
        });
      });
      Mousetrap.bind(["ctrl+w", "command+w"], function(e) {
        var _ref;
        e.preventDefault();
        return (_ref = _this.openFiles[_this.openFile]) != null ? _ref.removeFromList() : void 0;
      });
      Backbone.Mediator.sub("filebrowser:open_file", this.addFile, this);
      Backbone.Mediator.sub("filebrowser:close_file", this.removeFile, this);
      return Backbone.Mediator.sub("file:renamed", this.renamedFile, this);
    };

    FilebrowserView.prototype.openFileAtIndex = function(index) {
      if (!this.arrayOpenFiles[index]) {
        return;
      }
      return this.openFiles[this.arrayOpenFiles[index]].open();
    };

    FilebrowserView.prototype.setModel = function(model) {
      var _ref, _ref1, _ref2,
        _this = this;
      if ((_ref = this.model) != null) {
        _ref.off('change', this.render, this);
      }
      if ((_ref1 = this.model) != null) {
        if ((_ref2 = _ref1.rootFolder) != null) {
          _ref2.off('add', this.render, this);
        }
      }
      this.model = model;
      this.model.on('change', this.render, this);
      return this.model.fetchRootFolder(function() {
        _this.render();
        return _this.model.rootFolder.on('add', _this.render, _this);
      });
    };

    FilebrowserView.prototype.render = function() {
      var _this = this;
      app.logger.log("FilebrowserView#render");
      this.$el.html(this.template.render());
      this.$('#open_files').sortable({
        axis: "y",
        stop: function(event, ui) {
          return _.each(_this.arrayOpenFiles, function(fullPath) {
            if (_this.openFiles[fullPath].model.cid === ui.item.attr('data-cid')) {
              _this.arrayOpenFiles.splice(_.indexOf(_this.arrayOpenFiles, fullPath), 1);
              return _this.arrayOpenFiles.splice(ui.item.index(), 0, fullPath);
            }
          });
        }
      });
      this.model.rootFolder.each(function(file) {
        var file_view;
        file_view = new FileView({
          model: file
        });
        return _this.$('#project_files').append(file_view.render().el);
      });
      return this;
    };

    FilebrowserView.prototype.addFile = function(file) {
      if (!_.has(this.openFiles, file.fullPath())) {
        this.openFiles[file.fullPath()] = new FileView({
          model: file
        }, {
          allowClose: true
        });
        this.arrayOpenFiles.push(file.fullPath());
        this.$('#open_files').append(this.openFiles[file.fullPath()].render().el);
      }
      _.each(this.openFiles, function(view) {
        return view.unmarkAsActive();
      });
      this.openFiles[file.fullPath()].markAsActive();
      return this.openFile = file.fullPath();
    };

    FilebrowserView.prototype.removeFile = function(file) {
      if (_.has(this.openFiles, file.fullPath())) {
        delete this.openFiles[file.fullPath()];
        this.arrayOpenFiles.splice(_.indexOf(this.arrayOpenFiles, file.fullPath()), 1);
        this.openFile = null;
        return app.code_editor.clearEditor();
      }
    };

    FilebrowserView.prototype.renamedFile = function(file, previous) {
      if (_.has(this.openFiles, file.fullPathNamed(previous))) {
        this.openFiles[file.fullPath()] = this.openFiles[file.fullPathNamed(previous)];
        return delete this.openFiles[file.fullPathNamed(previous)];
      }
    };

    return FilebrowserView;

  })(Backbone.View);
  
}});

window.require.define({"views/navbar_view": function(exports, require, module) {
  var NavbarView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = NavbarView = (function(_super) {

    __extends(NavbarView, _super);

    function NavbarView() {
      this.hideStatus = __bind(this.hideStatus, this);

      this.showStatus = __bind(this.showStatus, this);
      return NavbarView.__super__.constructor.apply(this, arguments);
    }

    NavbarView.prototype.className = "navbar navbar-fixed-top navbar-inverse";

    NavbarView.prototype.template = require('./templates/navbar');

    NavbarView.prototype.statuses = [];

    NavbarView.prototype.showingStatus = false;

    NavbarView.prototype.showProgressTimeout = null;

    NavbarView.prototype.events = {
      "click [data-menu_id=build]": "buildProject",
      "click [data-menu_id=build-run]": "buildAndRun",
      "click [data-menu_id=run]": "runProject"
    };

    NavbarView.prototype.initialize = function() {
      var _this = this;
      Backbone.Mediator.sub('progress:show', this.showProgress, this);
      Backbone.Mediator.sub('progress:hide', this.hideProgress, this);
      Backbone.Mediator.sub('progress:set', this.setProgress, this);
      Backbone.Mediator.sub('status:set', this.showStatus, this);
      this.bindKeys();
      this.loadingCount = 0;
      this.$el.bind('ajaxStart', function() {
        _this.loadingCount += 1;
        if (_this.loadingCount === 1) {
          _this.showProgress();
          return app.logger.log("Syncing started.");
        }
      });
      return this.$el.bind('ajaxStop', function() {
        _this.loadingCount -= 1;
        if (_this.loadingCount === 0) {
          _this.hideProgress();
          return app.logger.log("Syncing ended.");
        }
      });
    };

    NavbarView.prototype.bindKeys = function() {
      var _this = this;
      Mousetrap.bind(["ctrl+r", "command+r"], function(e) {
        e.preventDefault();
        return app.editor().updateAndSave(function() {
          return _this.buildAndRun();
        });
      });
      return Mousetrap.bind(["ctrl+b", "command+b"], function(e) {
        e.preventDefault();
        return app.editor().updateAndSave(function() {
          return _this.buildProject();
        });
      });
    };

    NavbarView.prototype.helpers = {
      divider: function() {
        return "<li class=\"divider\"></li>";
      },
      menuItem: function(title, url, options) {
        if (options == null) {
          options = {};
        }
        options = _.defaults(options, {
          icon: "blank",
          shortcut: "",
          menu_id: ""
        });
        return "<li>\n  <a href=\"" + url + "\" data-menu_id=\"" + options.menu_id + "\">\n    <i class=\"icon-" + options.icon + "\"></i>\n    " + title + "\n    <div class=\"pull-right keyboard-shortcut\">" + options.shortcut + "</div>\n  </a>\n</li>";
      }
    };

    NavbarView.prototype.showStatus = function(status, options) {
      var _ref;
      if (options == null) {
        options = {};
      }
      options = _.defaults(options, {
        sticky: false
      });
      clearTimeout(this.statusTimeout);
      if (!options.sticky) {
        this.statusTimeout = setTimeout(this.hideStatus, 3000);
      }
      return this.$('.switch-status').animate({
        top: 20,
        opacity: 0
      }, (_ref = this.$('.switch-status').is('hidden')) != null ? _ref : {
        0: 500
      }, function() {
        return $(this).html(status).css({
          display: 'inline',
          top: -20,
          opacity: 0
        }).animate({
          top: 11,
          opacity: 1
        });
      });
    };

    NavbarView.prototype.hideStatus = function() {
      return this.$('.switch-status').animate({
        top: '20px',
        opacity: 0
      });
    };

    NavbarView.prototype.showProgress = function() {
      var _this = this;
      return this.showProgressTimeout = setTimeout(function() {
        _this.$('.progress').css({
          opacity: 0,
          display: "inline",
          width: 0
        });
        _this.$('.progress').animate({
          opacity: 1,
          width: 100
        });
        return _this.showProgressTimeout = null;
      }, 500);
    };

    NavbarView.prototype.hideProgress = function() {
      var _this = this;
      if (this.showProgressTimeout != null) {
        clearTimeout(this.showProgressTimeout);
        return this.showProgressTimeout = null;
      } else {
        return setTimeout(function() {
          return _this.$('.progress').animate({
            opacity: 0,
            width: 0
          });
        }, 800);
      }
    };

    NavbarView.prototype.setProgress = function(progress) {
      return this.$('.progress .bar').css('width', progress);
    };

    NavbarView.prototype.render = function() {
      this.$el.html(this.template.render({
        divider: this.helpers.divider,
        menuItem: this.helpers.menuItem
      }));
      return this;
    };

    NavbarView.prototype.buildProject = function() {
      return app.project.buildProject();
    };

    NavbarView.prototype.runProject = function() {
      return app.project.runProject();
    };

    NavbarView.prototype.buildAndRun = function() {
      return app.project.buildAndRun();
    };

    return NavbarView;

  })(Backbone.View);
  
}});

window.require.define({"views/projects_view": function(exports, require, module) {
  var Project, ProjectsView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Project = require('models/project');

  module.exports = ProjectsView = (function(_super) {

    __extends(ProjectsView, _super);

    function ProjectsView() {
      return ProjectsView.__super__.constructor.apply(this, arguments);
    }

    ProjectsView.prototype.className = 'modal hide fade';

    ProjectsView.prototype.id = "projects_modal";

    ProjectsView.prototype.template = require('./templates/projects');

    ProjectsView.prototype.events = {
      "submit form": "createProject"
    };

    ProjectsView.prototype.subscriptions = {
      "modal:hide": "destroy"
    };

    ProjectsView.prototype.initialize = function() {
      return this.collection.on('all', this.render, this);
    };

    ProjectsView.prototype.render = function() {
      this.projects = this.collection.map(function(project) {
        return {
          id: project.get('id'),
          name: project.get('name'),
          created_at: project.get('created_at')
        };
      });
      this.$el.html(this.template.render({
        projects: this.projects
      }));
      return this;
    };

    ProjectsView.prototype.destroy = function() {
      $("#" + this.id).modal('hide');
      return this.remove();
    };

    ProjectsView.prototype.createProject = function(e) {
      var project,
        _this = this;
      e.preventDefault();
      this.$('button').attr('disabled', true).html('Wait...');
      this.$('#project_name').attr('disabled', true);
      project = new Project({
        name: this.$('#project_name').val()
      });
      return project.create(function() {
        _this.collection.add(project);
        return app.router.navigate("#/projects/" + (project.get('id')));
      });
    };

    return ProjectsView;

  })(Backbone.View);
  
}});

window.require.define({"views/templates/code_editor": function(exports, require, module) {
  module.exports = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");return _.fl();;});
}});

window.require.define({"views/templates/contextual_file_menu": function(exports, require, module) {
  module.exports = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<ul class=\"dropdown-menu\">");_.b("\n" + i);if(!_.s(_.f("allowClose",c,p,1),c,p,1,0,0,"")){_.b("    <li><a href=\"javascript:;\" class=\"new-file\">New File</a></li>");_.b("\n" + i);_.b("    <li><a href=\"javascript:;\" class=\"new-folder\">New Folder</a></li>");_.b("\n" + i);_.b("    <li><a href=\"javascript:;\" class=\"rename-file\">Rename</a></li>");_.b("\n");};_.b("  <li><a href=\"javascript:;\" class=\"delete-file\">Delete</a></li>");_.b("\n" + i);_.b("</ul>");return _.fl();;});
}});

window.require.define({"views/templates/file": function(exports, require, module) {
  module.exports = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"file-item\">");_.b("\n" + i);_.b("  <a href=\"javascript:;\" id=\"cid_");_.b(_.v(_.f("cid",c,p,0)));_.b("\">");_.b("\n" + i);if(_.s(_.f("isDirectory",c,p,1),c,p,0,87,259,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("directory",c,p,1),c,p,0,108,156,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <i class=\"icon-folder-open\"></i>");_.b("\n");});c.pop();}if(!_.s(_.f("directory",c,p,1),c,p,1,0,0,"")){_.b("        <i class=\"icon-folder-close\"></i>");_.b("\n");};});c.pop();}_.b("\n" + i);if(!_.s(_.f("isDirectory",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("isView",c,p,1),c,p,0,315,361,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <i class=\"icon-eye-open\"></i> ");_.b("\n");});c.pop();}if(!_.s(_.f("isView",c,p,1),c,p,1,0,0,"")){_.b("        <i class=\"icon-file\"></i> ");_.b("\n");};};_.b("\n" + i);if(_.s(_.f("showForm",c,p,1),c,p,0,483,565,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <input type=\"text\" value=\"");_.b(_.v(_.f("name",c,p,0)));_.b("\" class=\"input-medium rename-field\">");_.b("\n");});c.pop();}if(!_.s(_.f("showForm",c,p,1),c,p,1,0,0,"")){_.b("      ");_.b(_.v(_.f("name",c,p,0)));_.b("\n");};_.b("  </a>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"subdirectory file-item\"></div>");_.b("\n");return _.fl();;});
}});

window.require.define({"views/templates/filebrowser": function(exports, require, module) {
  module.exports = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<ul class=\"nav nav-list\">");_.b("\n" + i);_.b("  <li class=\"nav-header\"> Open Files </li>");_.b("\n" + i);_.b("</ul>");_.b("\n" + i);_.b("<div class=\"nav nav-list\" id=\"open_files\"></div>");_.b("\n" + i);_.b("\n" + i);_.b("<ul class=\"nav nav-list\">");_.b("\n" + i);_.b("  <li class=\"nav-header\">Project</li>");_.b("\n" + i);_.b("</ul>");_.b("\n" + i);_.b("<div class=\"nav nav-list\" id=\"project_files\"></div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"separator\"><!-- separator, keeps the status bar at \"bar\" ;P --></div>");return _.fl();;});
}});

window.require.define({"views/templates/navbar": function(exports, require, module) {
  module.exports = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"navbar-inner\">");_.b("\n" + i);_.b("  <div class=\"container-fluid\">");_.b("\n" + i);_.b("    <a class=\"brand\" href=\"javascript:;\"><strong>Switch IDE</strong></a>");_.b("\n" + i);_.b("\n" + i);_.b("    <ul class=\"nav\">");_.b("\n" + i);_.b("      <li class=\"dropdown\">");_.b("\n" + i);_.b("        <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">");_.b("\n" + i);_.b("          <i class=\"icon-file\"></i>");_.b("\n" + i);_.b("          File");_.b("\n" + i);_.b("          <b class=\"caret\"></b>");_.b("\n" + i);_.b("        </a>");_.b("\n" + i);_.b("        <ul class=\"dropdown-menu\">");_.b("\n" + i);_.b("          <li>");_.b("\n" + i);_.b("            <a href=\"javascript:;\">");_.b("\n" + i);_.b("              <i class=\"icon-plus\"></i>");_.b("\n" + i);_.b("              New Project");_.b("\n" + i);_.b("              <div class=\"pull-right keyboard-shortcut\">⌘⇧N</div>");_.b("\n" + i);_.b("            </a>");_.b("\n" + i);_.b("          </li>");_.b("\n" + i);_.b("\n" + i);_.b("          <li>");_.b("\n" + i);_.b("            <a href=\"javascript:;\">");_.b("\n" + i);_.b("              <i class=\"icon-blank\"></i>");_.b("\n" + i);_.b("              New File");_.b("\n" + i);_.b("              <div class=\"pull-right keyboard-shortcut\">⌘N</div>");_.b("\n" + i);_.b("            </a>");_.b("\n" + i);_.b("          </li>");_.b("\n" + i);_.b("\n" + i);_.b("          <li>");_.b("\n" + i);_.b("            <a href=\"javascript:;\">");_.b("\n" + i);_.b("              <i class=\"icon-upload\"></i>");_.b("\n" + i);_.b("              Add Files");_.b("\n" + i);_.b("            </a>");_.b("\n" + i);_.b("          </li>");_.b("\n" + i);_.b("\n" + i);_.b("          <li>");_.b("\n" + i);_.b("            <a href=\"javascript:;\">");_.b("\n" + i);_.b("              <i class=\"icon-save\"></i>");_.b("\n" + i);_.b("              Save");_.b("\n" + i);_.b("              <div class=\"pull-right keyboard-shortcut\">⌘S</div>");_.b("\n" + i);_.b("            </a>");_.b("\n" + i);_.b("          </li>");_.b("\n" + i);_.b("\n" + i);_.b("          <li>");_.b("\n" + i);_.b("            <a href=\"javascript:;\">");_.b("\n" + i);_.b("              <i class=\"icon-fire\"></i>");_.b("\n" + i);_.b("              Quick Open");_.b("\n" + i);_.b("              <div class=\"pull-right keyboard-shortcut\">⌘T</div>");_.b("\n" + i);_.b("            </a>");_.b("\n" + i);_.b("          </li>");_.b("\n" + i);_.b("\n" + i);_.b("          <li class=\"divider\"></li>");_.b("\n" + i);_.b("\n" + i);_.b("          <li>");_.b("\n" + i);_.b("            <a href=\"javascript:;\">");_.b("\n" + i);_.b("              <i class=\"icon-remove\"></i>");_.b("\n" + i);_.b("              Close Project");_.b("\n" + i);_.b("            </a>");_.b("\n" + i);_.b("          </li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </li>");_.b("\n" + i);_.b("    </ul>");_.b("\n" + i);_.b("\n" + i);_.b("    <ul class=\"nav\">");_.b("\n" + i);_.b("      <li class=\"dropdown\">");_.b("\n" + i);_.b("        <a href=\"javascript:;\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">");_.b("\n" + i);_.b("          <i class=\"icon-briefcase\"></i>");_.b("\n" + i);_.b("          Project");_.b("\n" + i);_.b("          <b class=\"caret\"></b>");_.b("\n" + i);_.b("        </a>");_.b("\n" + i);_.b("        <ul class=\"dropdown-menu\">");_.b("\n" + i);_.b("          <!-- ");_.b(_.t(_.f("menuItem 'Build & Run', 'javascript:;', icon: 'legal', shortcut: '⌘R', menu_id: 'build-run'",c,p,0)));_.b("\n" + i);_.b("          ");_.b(_.t(_.f("menuItem 'Build', 'javascript:;', shortcut: '⌘B', menu_id: 'build'",c,p,0)));_.b("\n" + i);_.b("          ");_.b(_.t(_.f("menuItem 'Run', 'javascript:;', icon: 'play', menu_id: 'run'",c,p,0)));_.b("\n" + i);_.b("          ");_.b(_.t(_.f("menuItem 'Test', 'javascript:;', icon: 'wrench', shortcut: '⌘⇧T'",c,p,0)));_.b("\n" + i);_.b("          ");_.b(_.t(_.f("menuItem 'Archive', 'javascript:;', icon: 'save'",c,p,0)));_.b(" -->");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </li>");_.b("\n" + i);_.b("    </ul>");_.b("\n" + i);_.b("\n" + i);_.b("    <ul class=\"nav\">");_.b("\n" + i);_.b("      <li class=\"dropdown\">");_.b("\n" + i);_.b("        <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">");_.b("\n" + i);_.b("          <i class=\"icon-github\"></i>");_.b("\n" + i);_.b("          Git");_.b("\n" + i);_.b("          <b class=\"caret\"></b>");_.b("\n" + i);_.b("        </a>");_.b("\n" + i);_.b("        <ul class=\"dropdown-menu\">");_.b("\n" + i);_.b("          <!-- ");_.b(_.t(_.f("menuItem 'Create Repo', 'javascript:;'",c,p,0)));_.b("\n" + i);_.b("          ");_.b(_.t(_.f("menuItem 'Commit', 'javascript:;', icon: 'ok', shortcut: '⌘⌥C'",c,p,0)));_.b("\n" + i);_.b("          ");_.b(_.t(_.f("menuItem 'Push', 'javascript:;', icon: 'upload-alt', shortcut: '⌘⌥P'",c,p,0)));_.b("\n" + i);_.b("          ");_.b(_.t(_.f("menuItem 'Pull', 'javascript:;', icon: 'download-alt', shortcut: '⌘⌥X'",c,p,0)));_.b("\n" + i);_.b("          <li class=\"divider\"></li>");_.b("\n" + i);_.b("          ");_.b(_.t(_.f("menuItem 'Switch Branch', 'javascript:;', icon: 'random'",c,p,0)));_.b("\n" + i);_.b("          ");_.b(_.t(_.f("menuItem 'Merge', 'javascript:;'",c,p,0)));_.b("\n" + i);_.b("          ");_.b(_.t(_.f("menuItem 'Tag', 'javascript:;', icon: 'tag'",c,p,0)));_.b(" -->");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </li>");_.b("\n" + i);_.b("    </ul>");_.b("\n" + i);_.b("\n" + i);_.b("    <ul class=\"nav\">");_.b("\n" + i);_.b("      <li class=\"dropdown\">");_.b("\n" + i);_.b("        <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">");_.b("\n" + i);_.b("          <i class=\"icon-th-large\"></i>");_.b("\n" + i);_.b("          Window");_.b("\n" + i);_.b("          <b class=\"caret\"></b>");_.b("\n" + i);_.b("        </a>");_.b("\n" + i);_.b("        <ul class=\"dropdown-menu\">");_.b("\n" + i);_.b("          <li>");_.b("\n" + i);_.b("            <a href=\"javascript:;\">");_.b("\n" + i);_.b("              <i class=\"icon-blank\"></i>");_.b("\n" + i);_.b("              Close");_.b("\n" + i);_.b("              <div class=\"pull-right keyboard-shortcut\">^W</div>");_.b("\n" + i);_.b("            </a>");_.b("\n" + i);_.b("          </li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </li>");_.b("\n" + i);_.b("    </ul>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"btn-group pull-right\">");_.b("\n" + i);_.b("      <a class=\"btn btn-success\" data-menu_id=\"build-run\">");_.b("\n" + i);_.b("        <i class=\"icon-legal\"></i>");_.b("\n" + i);_.b("        Build & Run");_.b("\n" + i);_.b("      </a>");_.b("\n" + i);_.b("      <a class=\"btn btn-success dropdown-toggle\" data-toggle=\"dropdown\">");_.b("\n" + i);_.b("        <span class=\"caret\"></span>");_.b("\n" + i);_.b("      </a>");_.b("\n" + i);_.b("      <ul class=\"dropdown-menu\">");_.b("\n" + i);_.b("        <li>");_.b("\n" + i);_.b("          <a href=\"javascript:;\" data-menu_id=\"build\">");_.b("\n" + i);_.b("            <i class=\"icon-blank\"></i>");_.b("\n" + i);_.b("            Build");_.b("\n" + i);_.b("            <div class=\"pull-right keyboard-shortcut\">⌘B</div>");_.b("\n" + i);_.b("          </a>");_.b("\n" + i);_.b("        </li>");_.b("\n" + i);_.b("\n" + i);_.b("        <li>");_.b("\n" + i);_.b("          <a href=\"javascript:;\" data-menu_id=\"run\">");_.b("\n" + i);_.b("            <i class=\"icon-play\"></i>");_.b("\n" + i);_.b("            Run");_.b("\n" + i);_.b("          </a>");_.b("\n" + i);_.b("        </li>");_.b("\n" + i);_.b("\n" + i);_.b("        <li>");_.b("\n" + i);_.b("          <a href=\"javascript:;\">");_.b("\n" + i);_.b("            <i class=\"icon-wrench\"></i>");_.b("\n" + i);_.b("            Test");_.b("\n" + i);_.b("            <div class=\"pull-right keyboard-shortcut\">⌘⇧T</div>");_.b("\n" + i);_.b("          </a>");_.b("\n" + i);_.b("        </li>");_.b("\n" + i);_.b("\n" + i);_.b("        <li>");_.b("\n" + i);_.b("          <a href=\"javascript:;\">");_.b("\n" + i);_.b("            <i class=\"icon-save\"></i>");_.b("\n" + i);_.b("            Archive");_.b("\n" + i);_.b("          </a>");_.b("\n" + i);_.b("        </li>");_.b("\n" + i);_.b("      </ul>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"progress progress-striped active pull-right\" style=\"display: none;\">");_.b("\n" + i);_.b("      <div class=\"bar\" style=\"width: 100%;\"></div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"pull-right\">");_.b("\n" + i);_.b("      <p class=\"switch-status\" style=\"position: relative\">Ready</p>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("</div>");return _.fl();;});
}});

window.require.define({"views/templates/projects": function(exports, require, module) {
  module.exports = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"modal-header\">");_.b("\n" + i);_.b("  <h3>Choose a project</h3>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<div class=\"modal-body\">");_.b("\n" + i);_.b("  <ul class=\"unstyled\">");_.b("\n" + i);if(_.s(_.f("projects",c,p,1),c,p,0,128,265,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <li>");_.b("\n" + i);_.b("        <a href=\"#/projects/");_.b(_.v(_.f("id",c,p,0)));_.b("\">");_.b(_.v(_.f("name",c,p,0)));_.b("</a>");_.b("\n" + i);_.b("        <span class=\"muted\">(created ");_.b(_.v(_.f("created_at",c,p,0)));_.b(")</span>");_.b("\n" + i);_.b("      </li>");_.b("\n");});c.pop();}_.b("  </ul>");_.b("\n" + i);_.b("\n" + i);_.b("  <hr>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"pull-right\">");_.b("\n" + i);_.b("    <form class=\"form-inline\">");_.b("\n" + i);_.b("      Or you can create new project:");_.b("\n" + i);_.b("      <div class=\"input-append\">");_.b("\n" + i);_.b("        <input class=\"span3\" type=\"text\" id=\"project_name\" placeholder=\"Project's Name\">");_.b("\n" + i);_.b("        <button type=\"submit\" class=\"btn btn-success\" style=\"margin-top: -1px;\">Create</button>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </form>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});
}});

window.require.define({"views/templates/view_editor": function(exports, require, module) {
  module.exports = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div id=\"view_editor_header\">");_.b("\n" + i);_.b("  <ul class=\"nav nav-tabs\">");_.b("\n" + i);_.b("    <li class=\"active pull-right view-editor-link\">");_.b("\n" + i);_.b("      <a href=\"javascript:;\">View Editor</a>");_.b("\n" + i);_.b("    </li>");_.b("\n" + i);_.b("    <li class=\"pull-right html-editor-link\"><a href=\"javascript:;\">HTML Source</a></li>");_.b("\n" + i);_.b("  </ul>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("<div id=\"view_container\" contenteditable>");_.b("\n" + i);_.b("  ");_.b(_.t(_.f("view",c,p,0)));_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div id=\"code_container\" style=\"display: none;\"></div>");_.b("\n" + i);_.b("\n" + i);_.b("<div id=\"component_sidebar\" class=\"component-sidebar\">");_.b("\n" + i);_.b("  <!-- <div class=\"switch-component\">");_.b("\n" + i);_.b("    <div class=\"preview\">");_.b("\n" + i);_.b("      &lt;html&gt;");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("    Custom HTML code");_.b("\n" + i);_.b("  </div> -->");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"grid-row\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"row\">");_.b("\n" + i);_.b("        <div class=\"span6\">&nbsp;</div>");_.b("\n" + i);_.b("        <div class=\"span6\">&nbsp;</div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Grid Row</span>");_.b("\n" + i);_.b("  </div>  ");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"row\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"row\"></div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Row</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"span\" data-component-drop-only=\"row\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"span1\"></div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Span</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <!-- Tables -->");_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"table\" data-width=\"400\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <table class=\"table table-bordered\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>First Column</th>");_.b("\n" + i);_.b("            <th>Second Column</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <td>First Row</td>");_.b("\n" + i);_.b("            <td>First Row</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Table</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"table-row\" data-component-drop-only=\"tbody\" data-preview=\"true\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <td>Cell</td>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"drag-preview\">");_.b("\n" + i);_.b("      <table class=\"table table-bordered\" style=\"width: 200px\"><tbody><tr><td>Row</td></tr></tbody></table>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Table Row</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"table-cell\" data-component-drop-only=\"tr\" data-preview=\"true\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <td>Cell</td>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"drag-preview\">");_.b("\n" + i);_.b("      <table class=\"table table-bordered\" style=\"width: 200px\"><tbody><tr><td>Cell</td></tr></tbody></table>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Table Cell</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <!-- Button -->");_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"button\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <button type=\"button\" class=\"btn btn-primary\">Button</button>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\">");_.b("\n" + i);_.b("      <button class=\"btn btn-primary btn-small\">Button</button>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("    <span class=\"name\">Button</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"button-toolbar\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"btn-toolbar\">");_.b("\n" + i);_.b("        <button class=\"btn\">Button</button>");_.b("\n" + i);_.b("\n" + i);_.b("        <div class=\"btn-group\">");_.b("\n" + i);_.b("          <button class=\"btn\">Left</button>");_.b("\n" + i);_.b("          <button class=\"btn\">Middle</button>");_.b("\n" + i);_.b("          <button class=\"btn\">Right</button>");_.b("\n" + i);_.b("        </div>  ");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Button Toolbar</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <!-- Button Group -->");_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"button-group\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"btn-group\">");_.b("\n" + i);_.b("        <button class=\"btn\">Left</button>");_.b("\n" + i);_.b("        <button class=\"btn\">Middle</button>");_.b("\n" + i);_.b("        <button class=\"btn\">Right</button>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Button Group</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <!-- Link -->");_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"a\">");_.b("\n" + i);_.b("    <div class=\"payload\"><a href=\"javascript:;\">Link</a></div>");_.b("\n" + i);_.b("    <div class=\"preview\">");_.b("\n" + i);_.b("      <a href=\"javascript:;\">&lt;a href&gt;</a>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("    <span class=\"name\">Link</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <!-- Plain Text Input -->");_.b("\n" + i);_.b("  <div class=\"switch-component\">");_.b("\n" + i);_.b("    <div class=\"payload\"><input type=\"text\"></div>");_.b("\n" + i);_.b("    <div class=\"preview\">");_.b("\n" + i);_.b("      <input type=\"text\" style=\"width: 30px;\" placeholder=\"Text\">");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("    <span class=\"name\">Input</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <form class=\"form-horizontal\">");_.b("\n" + i);_.b("        <div class=\"control-group\">");_.b("\n" + i);_.b("          <div class=\"control-label\"><label for=\"new_input\">Label</label></div>");_.b("\n" + i);_.b("          <div class=\"controls\"><input type=\"text\" name=\"new_input\" id=\"new_input\"></div>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("\n" + i);_.b("        <div class=\"control-group\">");_.b("\n" + i);_.b("          <div class=\"control-label\"><label for=\"new_input2\">Label 2</label></div>");_.b("\n" + i);_.b("          <div class=\"controls\"><input type=\"text\" name=\"new_input2\" id=\"new_input2\"></div>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("\n" + i);_.b("        <div class=\"form-actions\">");_.b("\n" + i);_.b("          <button type=\"submit\" class=\"btn btn-primary\">Submit</button>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </form>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <!-- Control Group Text Input with Label -->");_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"label-button\" data-component-drop-only=\"form\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"control-group\">");_.b("\n" + i);_.b("        <div class=\"control-label\"><label for=\"new_input\">Label</label></div>");_.b("\n" + i);_.b("        <div class=\"controls\"><input type=\"text\" name=\"new_input\" id=\"new_input\"></div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\">");_.b("\n" + i);_.b("      <input type=\"text\" style=\"width: 30px;\" placeholder=\"Text\">");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Input</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"label-checkbox-group\" data-component-drop-only=\"form\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"control-group\">");_.b("\n" + i);_.b("        <div class=\"control-label\"><label>Checkbox</label></div>");_.b("\n" + i);_.b("        <div class=\"controls\">");_.b("\n" + i);_.b("          <label class=\"checkbox\">");_.b("\n" + i);_.b("            <input type=\"checkbox\" value=\"\">");_.b("\n" + i);_.b("            Checkbox");_.b("\n" + i);_.b("          </label>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Checkbox Group</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"label-checkbox-single\" data-component-drop-only=\".controls\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <label class=\"checkbox\">");_.b("\n" + i);_.b("        <input type=\"checkbox\" value=\"\">");_.b("\n" + i);_.b("        Checkbox");_.b("\n" + i);_.b("      </label>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Checkbox (single)</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"label-radio-group\" data-component-drop-only=\"form\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"control-group\">");_.b("\n" + i);_.b("        <div class=\"control-label\"><label>Radio</label></div>");_.b("\n" + i);_.b("        <div class=\"controls\">");_.b("\n" + i);_.b("          <label class=\"radio\">");_.b("\n" + i);_.b("            <input type=\"radio\" name=\"optionsRadios\" id=\"optionsRadios1\" value=\"option1\" checked>");_.b("\n" + i);_.b("            Radio 1");_.b("\n" + i);_.b("          </label>");_.b("\n" + i);_.b("          <label class=\"radio\">");_.b("\n" + i);_.b("            <input type=\"radio\" name=\"optionsRadios\" id=\"optionsRadios2\" value=\"option2\">");_.b("\n" + i);_.b("            Radio 2");_.b("\n" + i);_.b("          </label>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Radio Group</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"label-radio-single\" data-component-drop-only=\".controls\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <label class=\"radio\">");_.b("\n" + i);_.b("        <input type=\"radio\" name=\"optionsRadios\" value=\"option1\">");_.b("\n" + i);_.b("        Radio");_.b("\n" + i);_.b("      </label>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Radio (single)</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"label-checkbox-inline-group\" data-component-drop-only=\"form\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"control-group\">");_.b("\n" + i);_.b("        <div class=\"control-label\"><label>Inline Checkboxes</label></div>");_.b("\n" + i);_.b("        <div class=\"controls\">");_.b("\n" + i);_.b("          <label class=\"checkbox inline\">");_.b("\n" + i);_.b("            <input type=\"checkbox\" id=\"inlineCheckbox1\" value=\"option1\"> 1");_.b("\n" + i);_.b("          </label>");_.b("\n" + i);_.b("          <label class=\"checkbox inline\">");_.b("\n" + i);_.b("            <input type=\"checkbox\" id=\"inlineCheckbox2\" value=\"option2\"> 2");_.b("\n" + i);_.b("          </label>");_.b("\n" + i);_.b("          <label class=\"checkbox inline\">");_.b("\n" + i);_.b("            <input type=\"checkbox\" id=\"inlineCheckbox3\" value=\"option3\"> 3");_.b("\n" + i);_.b("          </label>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Inline Checkboxes</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"label-checkbox-inline-single\" data-component-drop-only=\".controls\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <label class=\"checkbox inline\">");_.b("\n" + i);_.b("        <input type=\"checkbox\" id=\"inlineCheckbox3\" value=\"option3\"> 1");_.b("\n" + i);_.b("      </label>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Inline Checkbox (single)</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"label-select\" data-component-drop-only=\"form\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"control-group\">");_.b("\n" + i);_.b("        <div class=\"control-label\"><label for=\"select\">Select</label></div>");_.b("\n" + i);_.b("        <div class=\"controls\">");_.b("\n" + i);_.b("          <select id=\"select\" name=\"select\">");_.b("\n" + i);_.b("            <optgroup>Options Group</optgroup>");_.b("\n" + i);_.b("            <option value=\"\">Option 1</option>");_.b("\n" + i);_.b("            <option value=\"\">Option 2</option>");_.b("\n" + i);_.b("            <option value=\"\">Option 3</option>");_.b("\n" + i);_.b("            <optgroup>Options Group</optgroup>");_.b("\n" + i);_.b("            <option value=\"\">Option 1</option>");_.b("\n" + i);_.b("          </select>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Select</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"label-prepended-input\" data-component-drop-only=\"form\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"control-group\">");_.b("\n" + i);_.b("        <div class=\"control-label\"><label for=\"prependedInput\">Prepend</label></div>");_.b("\n" + i);_.b("        <div class=\"controls\">");_.b("\n" + i);_.b("          <div class=\"input-prepend\">");_.b("\n" + i);_.b("            <span class=\"add-on\">@</span><input class=\"span2\" id=\"prependedInput\" size=\"16\" type=\"text\" placeholder=\"Username\">");_.b("\n" + i);_.b("          </div>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Prepended Input</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"label-appended-input\" data-component-drop-only=\"form\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"control-group\">");_.b("\n" + i);_.b("        <div class=\"control-label\"><label for=\"appendedInput\">Append</label></div>");_.b("\n" + i);_.b("        <div class=\"controls\">");_.b("\n" + i);_.b("          <div class=\"input-append\">");_.b("\n" + i);_.b("            <input class=\"span2\" id=\"appendedInput\" size=\"16\" type=\"text\"><span class=\"add-on\">.00</span>");_.b("\n" + i);_.b("          </div>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Appended Input</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"label-combined-input\" data-component-drop-only=\"form\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"control-group\">");_.b("\n" + i);_.b("        <div class=\"control-label\"><label for=\"appendedInput\">Append</label></div>");_.b("\n" + i);_.b("        <div class=\"controls\">");_.b("\n" + i);_.b("          <div class=\"input-prepend input-append\">");_.b("\n" + i);_.b("            <span class=\"add-on\">$</span><input class=\"span2\" id=\"appendedInput\" size=\"16\" type=\"text\"><span class=\"add-on\">.00</span>");_.b("\n" + i);_.b("          </div>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Combined Input</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"form-inline-help\" data-component-drop-only=\".controls\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <span class=\"help-inline\">Inline Help</span>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Inline Help</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"form-block-help\" data-component-drop-only=\".controls\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <span class=\"help-block\">Block Help</span>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Form Block Help</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"button-dropdown\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"btn-group\">");_.b("\n" + i);_.b("        <a class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\">");_.b("\n" + i);_.b("          Action");_.b("\n" + i);_.b("          <span class=\"caret\"></span>");_.b("\n" + i);_.b("        </a>");_.b("\n" + i);_.b("        <ul class=\"dropdown-menu\">");_.b("\n" + i);_.b("          <li><a href=\"javascript:;\">Menu Item</a></li>");_.b("\n" + i);_.b("          <li><a href=\"javascript:;\">Menu Item</a></li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Button Dropdown</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"button-dropdown-split\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"btn-group\">");_.b("\n" + i);_.b("        <button class=\"btn\">Action</button>");_.b("\n" + i);_.b("        <button class=\"btn dropdown-toggle\" data-toggle=\"dropdown\">");_.b("\n" + i);_.b("          <span class=\"caret\"></span>");_.b("\n" + i);_.b("        </button>");_.b("\n" + i);_.b("        <ul class=\"dropdown-menu\">");_.b("\n" + i);_.b("          <li><a href=\"javascript:;\">Menu Item</a></li>");_.b("\n" + i);_.b("          <li><a href=\"javascript:;\">Menu Item</a></li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Split Button Dropdown</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"tabs\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <ul class=\"nav nav-tabs\">");_.b("\n" + i);_.b("        <li class=\"active\">");_.b("\n" + i);_.b("          <a href=\"javascript:;\">Tab 1</a>");_.b("\n" + i);_.b("        </li>");_.b("\n" + i);_.b("        <li><a href=\"javascript:;\">Tab 2</a></li>");_.b("\n" + i);_.b("        <li><a href=\"javascript:;\">Tab 3</a></li>");_.b("\n" + i);_.b("      </ul>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Tabs</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"navlist\" data-min-width=\"300\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"well\" style=\"padding: 8px 0;\">");_.b("\n" + i);_.b("        <ul class=\"nav nav-list\">");_.b("\n" + i);_.b("          <li class=\"nav-header\">List header</li>");_.b("\n" + i);_.b("          <li class=\"active\"><a href=\"javascript:;\">Home</a></li>");_.b("\n" + i);_.b("          <li><a href=\"javascript:;\">Library</a></li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Nav List</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"hero-unit\" data-min-width=\"300\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"hero-unit\">");_.b("\n" + i);_.b("        <h1>Heading</h1>");_.b("\n" + i);_.b("        <p>Tagline</p>");_.b("\n" + i);_.b("        <p>");_.b("\n" + i);_.b("          <a class=\"btn btn-primary btn-large\">");_.b("\n" + i);_.b("            Learn more");_.b("\n" + i);_.b("          </a>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Hero Unit</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"page-header\" data-min-width=\"400\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"page-header\">");_.b("\n" + i);_.b("        <h1>Title <small>Subtext</small></h1>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Page Header</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"alert\" data-min-width=\"400\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"alert\">");_.b("\n" + i);_.b("        <button type=\"button\" class=\"close\" data-dismiss=\"alert\">×</button>");_.b("\n" + i);_.b("        <strong>Warning!</strong> Best check yo self, you're not looking too good.");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Alert</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"alert-block\" data-min-width=\"300\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"alert alert-block\">");_.b("\n" + i);_.b("        <button type=\"button\" class=\"close\" data-dismiss=\"alert\">×</button>");_.b("\n" + i);_.b("        <h4>Warning!</h4>");_.b("\n" + i);_.b("        Best check yo self, you're not...");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Alert Block</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"progress-bar\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"progress\">");_.b("\n" + i);_.b("        <div class=\"bar\" style=\"width: 60%;\"></div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Progress Bar</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"well\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"well\">");_.b("\n" + i);_.b("        Well");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Well</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"navbar\" data-min-width=\"300\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <div class=\"navbar navbar-inverse\">");_.b("\n" + i);_.b("        <div class=\"navbar-inner\">");_.b("\n" + i);_.b("          <div class=\"container\">");_.b("\n" + i);_.b("            <button type=\"button\" class=\"btn btn-navbar\" data-toggle=\"collapse\" data-target=\".nav-collapse\"> ");_.b("\n" + i);_.b("              <span class=\"icon-bar\"></span>");_.b("\n" + i);_.b("              <span class=\"icon-bar\"></span>");_.b("\n" + i);_.b("              <span class=\"icon-bar\"></span>");_.b("\n" + i);_.b("            </button> ");_.b("\n" + i);_.b("\n" + i);_.b("            <a class=\"brand\" href=\"#/\">Brand</a>");_.b("\n" + i);_.b("\n" + i);_.b("            <div class=\"nav-collapse collapse\">");_.b("\n" + i);_.b("              <ul class=\"nav\">");_.b("\n" + i);_.b("                <li><a href=\"#/\">Home</a></li>");_.b("\n" + i);_.b("              </ul>");_.b("\n" + i);_.b("            </div>");_.b("\n" + i);_.b("          </div>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Navbar</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"navbar-nav-link\" data-component-drop-only=\"ul.nav\" data-preview=\"true\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <li><a href=\"#\">Link</a></li>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"drag-preview\">");_.b("\n" + i);_.b("      <div class=\"navbar navbar-inverse\">");_.b("\n" + i);_.b("        <div class=\"navbar-inner\">");_.b("\n" + i);_.b("          <ul class=\"nav\">");_.b("\n" + i);_.b("            <li><a href=\"#\">Link</a></li>");_.b("\n" + i);_.b("          </ul>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Navbar Link</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"navbar-nav-divider\" data-component-drop-only=\"ul.nav\" data-preview=\"true\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <li class=\"divider-vertical\"></li>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"drag-preview\">");_.b("\n" + i);_.b("      <div class=\"navbar navbar-inverse\">");_.b("\n" + i);_.b("        <div class=\"navbar-inner\">");_.b("\n" + i);_.b("          <ul class=\"nav\">");_.b("\n" + i);_.b("            <li class=\"divider-vertical\"></li>");_.b("\n" + i);_.b("          </ul>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Navbar Divider</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"navbar-nav-form\" data-component-drop-only=\".navbar-inner\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <form class=\"navbar-form pull-left\">");_.b("\n" + i);_.b("        <input type=\"text\" class=\"span2\">");_.b("\n" + i);_.b("        <button type=\"submit\" class=\"btn\">Submit</button>");_.b("\n" + i);_.b("      </form>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Navbar Form</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"navbar-nav-search-form\" data-component-drop-only=\".navbar-inner\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <form class=\"navbar-search pull-left\">");_.b("\n" + i);_.b("        <input type=\"text\" class=\"search-query\" placeholder=\"Search\">");_.b("\n" + i);_.b("      </form>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Navbar Search Form</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"navbar-nav-dropdown\" data-component-drop-only=\"ul.nav\" data-preview=\"true\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <li class=\"dropdown\">");_.b("\n" + i);_.b("        <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">");_.b("\n" + i);_.b("          Dropdown");_.b("\n" + i);_.b("          <b class=\"caret\"></b>");_.b("\n" + i);_.b("        </a>");_.b("\n" + i);_.b("        <ul class=\"dropdown-menu\">");_.b("\n" + i);_.b("          <li><a href=\"#\">Link</a></li>");_.b("\n" + i);_.b("          <li><a href=\"#\">Link</a></li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </li>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"drag-preview\">");_.b("\n" + i);_.b("      <div class=\"navbar navbar-inverse\">");_.b("\n" + i);_.b("        <div class=\"navbar-inner\">");_.b("\n" + i);_.b("          <ul class=\"nav\">");_.b("\n" + i);_.b("            <li class=\"dropdown\">");_.b("\n" + i);_.b("              <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">");_.b("\n" + i);_.b("                Dropdown");_.b("\n" + i);_.b("                <b class=\"caret\"></b>");_.b("\n" + i);_.b("              </a>");_.b("\n" + i);_.b("              <ul class=\"dropdown-menu\">");_.b("\n" + i);_.b("                <li><a href=\"#\">Link</a></li>");_.b("\n" + i);_.b("                <li><a href=\"#\">Link</a></li>");_.b("\n" + i);_.b("              </ul>");_.b("\n" + i);_.b("            </li>");_.b("\n" + i);_.b("          </ul>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Navbar Dropdown</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"label\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <span class=\"label label-success\">Label</span>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Label</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"switch-component\" data-component-type=\"badge\">");_.b("\n" + i);_.b("    <div class=\"payload\">");_.b("\n" + i);_.b("      <span class=\"badge badge-success\">42</span>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"preview\"></div>");_.b("\n" + i);_.b("    <span class=\"name\">Badge</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});
}});

window.require.define({"views/view_editor_view": function(exports, require, module) {
  var File, ViewEditor,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  File = require('models/file');

  module.exports = ViewEditor = (function(_super) {

    __extends(ViewEditor, _super);

    function ViewEditor() {
      return ViewEditor.__super__.constructor.apply(this, arguments);
    }

    ViewEditor.prototype.className = 'view-editor';

    ViewEditor.prototype.id = 'view_editor';

    ViewEditor.prototype.template = require('./templates/view_editor');

    ViewEditor.prototype.active = false;

    ViewEditor.prototype.placeholderModel = true;

    ViewEditor.prototype.activeView = "view";

    ViewEditor.prototype.lastHoveredDroppable = null;

    ViewEditor.prototype.draggable = null;

    ViewEditor.prototype.dragThreshold = 30.0;

    ViewEditor.prototype.lastDragPosition = {
      x: 0,
      y: 0
    };

    ViewEditor.prototype.insertBefore = false;

    ViewEditor.prototype.events = {
      "click #view_container a": "dummy",
      "click #view_container button": "dummy",
      "click #view_container input[type=button]": "dummy",
      "click label": "dummy",
      "click #view_editor_header .html-editor-link a": "showHtmlEditor",
      "click #view_editor_header .view-editor-link a": "showViewEditor"
    };

    ViewEditor.prototype.initialize = function() {
      var _this = this;
      this.model || (this.model = new File);
      Mousetrap.bind(['ctrl+alt+up', 'command+option+up', 'ctrl+alt+down', 'command+option+down'], function(e) {
        e.preventDefault();
        if (_this.activeView === 'html') {
          return _this.showViewEditor();
        } else if (_this.activeView === 'view') {
          return _this.showHtmlEditor();
        }
      });
      Mousetrap.bind(['shift'], function(e) {
        return _this.insertBefore = true;
      }, 'keydown');
      Mousetrap.bind(['shift'], function(e) {
        return _this.insertBefore = false;
      }, 'keyup');
      Mousetrap.bind(['ctrl+z', 'command+z'], function(e) {
        e.preventDefault();
        _this.codemirror.undo();
        if (_this.activeView === "view") {
          return _this.loadViewEditor(_this.codemirror.getValue());
        }
      });
      return Mousetrap.bind(['ctrl+shift+z', 'command+shift+z'], function(e) {
        e.preventDefault();
        _this.codemirror.redo();
        if (_this.activeView === "view") {
          return _this.loadViewEditor(_this.codemirror.getValue());
        }
      });
    };

    ViewEditor.prototype.updateAndSave = function(callback) {
      if (this.placeholderModel) {
        return false;
      }
      this.model.set('content', this.getContent());
      return this.model.updateContent(callback);
    };

    ViewEditor.prototype.getContent = function() {
      var html;
      if (this.activeView === "html") {
        html = this.codemirror.getValue();
        return html;
      } else if (this.activeView === "view") {
        this.unbindDroppables();
        this.$('#view_container').find('.ui-droppable').removeClass('ui-droppable');
        html = this.$('#view_container').html();
        html = style_html(html, {
          indent_size: 2
        });
        html = html.replace(/\s?class=""/g, "");
        return html;
      }
    };

    ViewEditor.prototype.showHtmlEditor = function(e) {
      return this.loadHtmlEditor();
    };

    ViewEditor.prototype.showViewEditor = function(e) {
      return this.loadViewEditor();
    };

    ViewEditor.prototype.loadHtmlEditor = function(content) {
      if (content == null) {
        content = null;
      }
      this.codemirror.setValue(content || this.getContent());
      this.$('#code_container, #code_container .CodeMirror-scroll').height($(window).height() - 40 - 45);
      this.$('#code_container').width($(window).width() - $('#filebrowser').width() * 2 - 5);
      this.$('#view_container').hide();
      this.$('#code_container').show();
      this.$('.view-editor-link').removeClass('active');
      this.$('.html-editor-link').addClass('active');
      this.codemirror.refresh();
      this.codemirror.focus();
      return this.activeView = "html";
    };

    ViewEditor.prototype.loadViewEditor = function(content) {
      if (content == null) {
        content = null;
      }
      this.$('#view_container').html(content || this.getContent());
      $('.view-editor #view_container').height($(window).height() - 40 - 45);
      this.$('#view_container').show();
      this.$('#code_container').hide();
      this.$('.view-editor-link').addClass('active');
      this.$('.html-editor-link').removeClass('active');
      return this.activeView = "view";
    };

    ViewEditor.prototype.render = function() {
      var self, _ref,
        _this = this;
      this.$el.html(this.template.render({
        view: (_ref = this.model) != null ? _ref.get('content') : void 0
      }));
      this.codemirror = CodeMirror(this.$('#code_container')[0], {
        value: this.model.get('content'),
        lineNumbers: true,
        tabSize: 2,
        onCursorActivity: function() {
          return _this.codemirror.matchHighlight("CodeMirror-matchhighlight");
        },
        mode: {
          name: "xml",
          htmlMode: true
        }
      });
      this.$('#code_container textarea').addClass('mousetrap');
      $('.view-editor #view_container').width($(window).width() - $('#filebrowser').width() * 2 - 15);
      $('.view-editor #view_editor_header').width($(window).width() - $('#filebrowser').width() * 2 - 15);
      self = this;
      this.$('div.switch-component').draggable({
        revert: "invalid",
        revertDuration: 100,
        zIndex: 9999,
        appendTo: "#center_container",
        helper: function() {
          var $preview;
          if ($(this).data('preview')) {
            $preview = $('.drag-preview', this).clone();
          } else {
            $preview = $('.payload', this).clone();
          }
          if ($(this).data('min-width')) {
            $preview.children().first().css('min-width', $(this).data('min-width'));
          }
          if ($(this).data('max-width')) {
            $preview.children().first().css('max-width', $(this).data('max-width'));
          }
          if ($(this).data('width')) {
            $preview.children().first().css('width', $(this).data('width'));
          }
          return $preview.html();
        },
        opacity: 0.7,
        cursor: "move",
        start: function(event, ui) {
          var only;
          only = $(this).data('component-drop-only');
          self.makeDroppable(only);
          return self.draggable = $(this);
        },
        drag: function(event, ui) {
          var distance;
          if (!self.lastHoveredDroppable) {
            return;
          }
          distance = Math.sqrt(Math.pow(ui.position.left - self.lastDragPosition.x, 2) + Math.pow(ui.position.top - self.lastDragPosition.y, 2));
          if (!(distance > self.dragThreshold)) {
            return;
          }
          self.lastDragPosition = {
            x: ui.position.left,
            y: ui.position.top
          };
          return self.putComponent(self, self.lastHoveredDroppable, {
            draggable: $(this),
            position: ui.position
          }, true);
        },
        stop: function() {
          self.removeComponent();
          self.unbindDroppables();
          return self.draggable = null;
        }
      });
      if (this.activeView === "html") {
        this.showHtmlEditor();
      }
      return this;
    };

    ViewEditor.prototype.show = function() {
      var _this = this;
      this.$el.show();
      this.active = true;
      return Mousetrap.bind(['ctrl+s', 'command+s'], function(e) {
        e.preventDefault();
        return _this.updateAndSave();
      });
    };

    ViewEditor.prototype.hide = function() {
      this.$el.hide();
      this.active = false;
      return Mousetrap.unbind(['ctrl+s', 'command+s']);
    };

    ViewEditor.prototype.unbindDroppables = function() {
      return this.$('#view_container, #view_container *').droppable("destroy");
    };

    ViewEditor.prototype.makeDroppable = function(only) {
      var exceptions, self;
      self = this;
      this.unbindDroppables();
      exceptions = 'img, button, input, select, option, optgroup';
      if (only) {
        only = "#view_container " + only;
      } else {
        only = "#view_container, #view_container *";
      }
      return this.$(only).not(exceptions).droppable({
        hoverClass: "hovering",
        greedy: true,
        drop: function(e, u) {
          self.putComponent(self, $(this), u, false);
          return self.lastHoveredDroppable = null;
        },
        over: function(e, u) {
          self.lastHoveredDroppable = $(this);
          return self.putComponent(self, $(this), u, true);
        },
        out: function(e, u) {
          return self.removeComponent();
        }
      });
    };

    ViewEditor.prototype.removeComponent = function() {
      return $('#view_container .preview-component').remove();
    };

    ViewEditor.prototype.putComponent = function(self, droppable, ui, over) {
      var closest, draggable, newComponent, payload, type;
      if (over == null) {
        over = false;
      }
      self.removeComponent();
      draggable = ui.draggable;
      payload = $('.payload', draggable).html();
      type = draggable.data('component-type');
      newComponent = $(payload);
      closest = $.nearest({
        x: ui.position.left,
        y: ui.position.top
      }, droppable.children()).last();
      if (closest.length === 0) {
        droppable.append(newComponent);
      } else {
        if (self.insertBefore) {
          newComponent.insertBefore(closest);
        } else {
          newComponent.insertAfter(closest);
        }
      }
      if (over) {
        newComponent.css({
          opacity: 0.7
        });
        return newComponent.addClass("preview-component");
      } else {
        return this.codemirror.setValue(self.getContent());
      }
    };

    ViewEditor.prototype.clear = function() {
      this.$('#view_container').html('');
      return this.codemirror.setValue('');
    };

    ViewEditor.prototype.setFile = function(file) {
      var _ref;
      if ((_ref = this.model) != null) {
        _ref.off('change:content', this.render, this);
      }
      this.clear();
      this.model = file;
      this.model.on('change:content', this.render, this);
      return this.placeholderModel = false;
    };

    ViewEditor.prototype.dummy = function(e) {
      return e.preventDefault();
    };

    return ViewEditor;

  })(Backbone.View);
  
}});

