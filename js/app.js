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
    initialize: function() {}
});

/**
 * This is a backbone collection which store
 * the list of Repos as collection
 */
var UserList = Backbone.Collection.extend({
    model: UserModel,
    localStorage: new Backbone.LocalStorage('UserList'),
    initialize: function() {}
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
        'click #add-user-button': 'findAndAddUser'
    },
    initialize: function(data) {
        _.extend(this, data);
        this.listenTo(this.userList, 'sync', this.renderList);
        this.render();
        this.userList.fetch();
    },
    render: function() {
        this.$el.html(_.template($('#Tpl-body').html()));
        $('#app-body-container').html(this.el);
    },
    renderList: function() {
        $('#user-list-container #user-list').empty();
        var userTpl = _.template($('#Tpl-user').html());
        $('#user-list-container #loader').hide();
        _.each((this.userList.models).reverse(), function(model, key) {
            $('#user-list-container #user-list').append(userTpl(model.toJSON()));
        });
    },
    findAndAddUser: function(e) {
        var that = this;
        this.userModel.userName = $('#autocomplete-input').val();
        this.userModel.fetch({
            error: function() {

            },
            success: function(model, response, options) {
                that.userList.add(model);
                that.userModel.save();
            },
        });
    }
});
$(document).ready(function() {

    // create a object of Headerview
    // which will render header view of app
    var headerView = new HeaderView();
    var bodyView = new BodyView({
        userModel: new UserModel(),
        userList: new UserList()
    });
});
