(function (global, _) {
  var Backbone = global.Backbone;
  Backbone.hasMany = Object;
  Backbone.RelationalModel = Backbone.Model.extend({
    _relations: null,

    constructor: function(attrs, options) {
      var self = this;
      self._relations = options && options.relations ? options.relations : self.relations
      delete self.relations
      self.relation = {}
      _.any(self._relations, function(rl_des) {
        var rlt = self.relation[rl_des['key']] = new (eval(rl_des['collectionType']))()
        rlt.on('add', function(model) {
          model.setRelation(rl_des['reverseRelation']['key'], self)
        });
        rlt.relations = {}
        rlt.setRelation(rl_des['reverseRelation']['key'], self)
      })
      Backbone.Model.call(self, attrs);
    },

    update: function(attrs, opts) {
      if (this.isNew()) {
        this.save(attrs, opts);
        return;
      }
      var options = {
        url: this.url(),
        contentType: 'application/json',
        dataType: 'json',
        type: 'PUT',
        data: {}
      }
      this.paramRoot ? options['data'][this.paramRoot] = attrs : options['data'] = attrs;
      opts['data'] = _.extend(opts['data'] || {}, options['data']);
      _.extend(options, opts);
      _.each(attrs, function(value, key) {
        this.set(key, value);
      }, this)
      options.data = JSON.stringify(options.data);
      return (this.sync || Backbone.sync).call(this, null, this, options);
    },

    setRelation: function(name, value) {
      var self = this;
      self.relation[name] = value
    },

    getRelation: function(name) {
      var self = this;
      return self.relation[name];
    },

    fetchRelated: function(name, opts) {
      opts = opts || {}
      var self = this, relation = null, params = {}, rlt, success;
      _.any(self._relations, function(rl) {
        if (rl['key'] == name) {
          rlt = rl;
          return true;
        }
      })
      if (!rlt) return
      relation = new (eval(rlt['collectionType']))()
      params[rlt['reverseRelation']['reference_id']] = self.id
      opts = _.extend({url: rlt.url || relation.url}, opts, {data: _.extend(params, opts.data || {})})
      success = opts.success
      opts.success = function() {
        relation.once('sync', function(response) {
          if (!opts.refresh) {
            var current_relation = self.getRelation(name);
            _.each(relation.models, function(model) {
              var m = current_relation.get(model.id);
              m ? _.extend(m.attributes , model.attributes) : current_relation.push(model)
            })

          } else {
            _.each(relation.models, function(model) {
              model.setRelation(rlt['reverseRelation']['key'], self)
            })
            self.setRelation(name, relation)
          }
          self.trigger('add:'+name);
          if (success) success(response)
        })
      }
      relation.fetch(opts)
    },

    toJSON: function(options) {
      var self = this, attrs = Backbone.Model.prototype.toJSON.call(self, options );
      return deepToJSON(attrs);
    }
  });

  Backbone.Collection.prototype.getRelation = function(name) {
    var self = this;
    return self.relations[name];
  }

  Backbone.Collection.prototype.setRelation = function(name, value) {
    var self = this;
    self.relations[name] = value;
  }

  var deepToJSON = function(attrs) {
    var json = {}, result;
    _.each(attrs, function(attr, index) {
      if (attr instanceof Backbone.Model || attr instanceof Backbone.Collection) {
        return
      } else if (_.isObject(attr) && _.keys(attr).length > 0) {
        result = deepToJSON(attr)
        if (_.keys(result).length > 0)
          json[index] = result
      } else if (!_.isFunction(attr)) {
        json[index] = attr
      }
    })
    return json
  }
})(this, _);
