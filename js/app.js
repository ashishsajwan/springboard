/**
 * This is a backbone model which store
 * the data for a Query/API Entity
 */
/**
 * This is a backbone model which store
 * the data for a Repo Entity
 */

var UserModel = Backbone.Model.extend({
    urlRoot: 'https://api.github.com/users/',
    userName: null,
    url: function() {
        return this.urlRoot + this.userName;
    },
    initialize: function(data) {
        this.userName = data.userName;
    }
});

/**
 * This is a backbone collection which store
 * the list of Repos as collection
 */
var UserList = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage('UserList'),
    initialize: function() {},
    comparator: function(a, b) {
        a = a.get(this.sort_key);
        b = b.get(this.sort_key);
        if (this.sort_order == 'asc') {
            return a > b ? 1 : a < b ? -1 : 0;
        } else {
            return a < b ? 1 : a > b ? -1 : 0;
        }
    }
});

/**
 * This is a backbone view which is responsible
 * for rendering Header of the app
 */
var HeaderView = Backbone.View.extend({
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html(_.template($('#Tpl-header').html()));
        $('#app-header-container').html(this.el);
    }
});


var BodyView = Backbone.View.extend({
    events: {
        'click #add-user-button': 'findAndAddUser',
        'click #user-list .removeUser .fa.fa-times': 'removeUser',
        'click #sort-container .sort': 'sortCards'
    },
    initialize: function(data) {
        this.listenTo(this.collection, 'sync', this.renderList);
        this.render();
        this.collection.fetch();
        this.listenTo(this.collection, 'sort', this.renderList);
    },
    render: function() {
        this.$el.html(_.template($('#Tpl-body').html()));
        $('#app-body-container').html(this.el);
    },
    renderList: function() {
        $('#user-list-container #user-list').empty();
        var userTpl = _.template($('#Tpl-user').html());
        $('#user-list-container #loader').hide();
        _.each(_.clone(this.collection.models).reverse(), function(model, key) {
            $('#user-list-container #user-list').append(userTpl(model.toJSON()));
        });
    },
    removeUser: function(e) {
        var userId = parseFloat($(e.currentTarget).parents('.card').attr('data-userid'));
        this.collection.get(userId).destroy();
    },
    findAndAddUser: function(e) {
        $(e.currentTarget).addClass('loading');
        var that = this;
        var userModel = new UserModel({
            userName: $('#autocomplete-input').val()
        });
        userModel.fetch({
            error: function() {
                Materialize.toast('Oops! Couldn\'t find that user', 4000)
            },
            success: function(model, response, options) {
                that.collection.add(model);
                userModel.save();
            },
            complete: function() {
                $(e.currentTarget).removeClass('loading')
                $('#autocomplete-input').val('');
            }
        });
    },
    sortCards: function(e) {
        this.collection.sort_order = $(e.currentTarget).hasClass('asc') ? 'desc' : 'asc';
        this.collection.sort_key = $(e.currentTarget).attr('id');
        this.collection.sort();
        $('#sort-container .sort').removeClass('asc desc');
        $(e.currentTarget).addClass(this.collection.sort_order);
    }
});
$(document).ready(function() {

    // create a object of Headerview
    // which will render header view of app
    var headerView = new HeaderView();
    var bodyView = new BodyView({
        collection: new UserList()
    });
});
