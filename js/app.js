/**
 * This is a backbone model which store
 * the data for a user Entity
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
 * the list of users as collection
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


/**
 * This is a backbone view which is responsible
 * for rendering body part of the app
 */
var BodyView = Backbone.View.extend({
    events: {
        'enter #autocomplete-input': 'findAndAddUser',
        'click #add-user-button': 'findAndAddUser',
        'click #user-list .removeUser .fa.fa-times': 'removeUser',
        'click #sort-container .sort': 'sortCards'
    },
    initialize: function(data) {
        // listen to sync event on collection and renderlist
        this.listenTo(this.collection, 'sync', this.renderList);

        // lets render the body part of the app
        this.render();

        // lets fetch collection now
        this.collection.fetch();

        // also listen to sort event on collection and renderList
        this.listenTo(this.collection, 'sort', this.renderList);
    },
    // here we just render the search input box and sorting elements
    // and also the container for list
    render: function() {
        this.$el.html(_.template($('#Tpl-body').html()));
        $('#app-body-container').html(this.el);
    },
    // go through the collection and render each user card in to the container
    renderList: function() {
        $('#user-list-container #user-list').empty();
        var userTpl = _.template($('#Tpl-user').html());
        $('#user-list-container #loader').hide();
        _.each(_.clone(this.collection.models).reverse(), function(model, key) {
            $('#user-list-container #user-list').append(userTpl(model.toJSON()));
        });
    },
    // when clicked on remove user lets remove user from list
    removeUser: function(e) {
        var userId = parseFloat($(e.currentTarget).parents('.card').attr('data-userid'));
        this.collection.get(userId).destroy();
        this.collection.trigger('sync');
    },
    // get the user details from github.. make a model out of the data
    // add model to collection, save it to LocalStorage and render the list
    findAndAddUser: function() {
        var input = $('#autocomplete-input');
        var button = $('#add-user-button');
        button.addClass('loading');
        input.attr('disabled', true);
        var that = this;
        var userModel = new UserModel({
            userName: input.val()
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
                button.removeClass('loading')
                input.val('');
                input.attr('disabled', false);
            }
        });
    },
    // this function just sets the parameter for sorting
    // rest is taken care of by backbone collection sort
    // sort collection and render list again
    sortCards: function(e) {
        this.collection.sort_order = $(e.currentTarget).hasClass('asc') ? 'desc' : 'asc';
        this.collection.sort_key = $(e.currentTarget).attr('id');
        this.collection.sort();
        $('#sort-container .sort').removeClass('asc desc');
        $(e.currentTarget).addClass(this.collection.sort_order);
    }
});
$(document).ready(function() {
    // capturing enter key on inputs and firing enter event
    // so that pressing enter of searchbox works
    $('#app-body-container').on('keyup', '#autocomplete-input', function(e) {
        if (e.keyCode == 13) {
            $(this).trigger('enter');
        }
    });
    // create a object of Headerview
    // which will render header view of app
    var headerView = new HeaderView();
    var bodyView = new BodyView({
        collection: new UserList()
    });
});
