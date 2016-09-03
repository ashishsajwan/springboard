/**
 * This is a backbone model which store
 * the data for header View
 */
var HeaderStatsModel = Backbone.Model.extend({
    defaults: {
        "totalRepos": 0,
        "language": null
    }
});

/**
 * This is a backbone model which store
 * the data for a Repo Entity
 */
var RepoModel = Backbone.Model.extend({
    initialize: function() {}
});

/**
 * This is a backbone collection which store
 * the list of books as collection
 */
var RepoList = Backbone.Collection.extend({
    model: RepoModel,
    parse: function(data) {
        _.extend(this, _.pick(data, ['total_count', 'incomplete_results']));
        return data.items;
    },
    comparator: function(a, b) {
        a = this.sanitizeNumber(a.get(this.sort_key));
        b = this.sanitizeNumber(b.get(this.sort_key));
        return a < b ? 1 : a > b ? -1 : 0;
    },
    sanitizeNumber: function(string) {
        if (string) {
            return Number(string.replace(/[^0-9\.]+/g, ""))
        }
    },
    url: 'https://api.github.com/search/repositories'
});

/**
 * This is a backbone view which is responsible
 * for rendering Header of the app
 */
var HeaderView = Backbone.View.extend({
    initialize: function() {
        // this.listenTo(this.model, 'sync', this.render);
        this.render();
    },
    render: function() {
        var headerTemplate = _.template($('#Tpl-header').html());
        this.$el.html(headerTemplate(this.model.toJSON()));
        $('#app-header-container').html(this.el);
    }

});

var BodyView = Backbone.View.extend({
    initialize: function() {
        /*
          When ever data inside collection is fetched from server 'sync' event
          will be triggered & then we can render the Repos as list inside this view
        */
        this.listenTo(this.collection, 'sync', this.renderReposList);

        this.collection.fetch({
            data: {
                q: 'tetris',
                language: 'assembly',
                sort: 'stars',
                order: 'desc'
            }
        });
    },
    renderReposList: function() {
        console.log(this.collection);
    }
})

$(document).ready(function() {
    // create a object of headerstatsModel
    var headerStatsModel = new HeaderStatsModel();

    // create a object of Headerview
    // which will render header view of app
    var headerView = new HeaderView({
        model: headerStatsModel
    });

    var bodyView = new BodyView({
        collection: new RepoList()
    });
});
