/**
 * This is a backbone model which store
 * the data for header View
 */
var HeaderStatsModel = Backbone.Model.extend({
    defaults: {
        "totalRepos": '-',
        "language": '-'
    }
});

var QueryDataModel = Backbone.Model.extend({
    defaults: {
        stars: {
            min: 0,
            max: 1000,
        },
        language: 'assembly'
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
        this.listenTo(this.model, 'change', this.render);
        this.render();
    },
    render: function() {
        var headerTemplate = _.template($('#Tpl-header').html());
        this.$el.html(headerTemplate(this.model.toJSON()));
        $('#app-header-container').html(this.el);
    }

});

var BodyView = Backbone.View.extend({
    events: {
        'change input.autocomplete': 'updateSearchData',
    },
    initialize: function(data) {
        this.renderBody();
        /**
         extend view with data so that custom data which was passed while
         initializing view can also get attached to view
        **/
        _.extend(this, data);

        /*
          When ever data inside collection is fetched from server 'sync' event
          will be triggered & then we can render the Repos as list inside this view
        */
        this.listenTo(this.collection, 'sync', this.renderReposList);
        this.listenTo(this.queryData, 'change', this.fetchRepos);
        this.fetchRepos();
    },
    updateSearchData: function(e) {
        if (e.currentTarget) {
            this.queryData.set({
                language: $(e.currentTarget).val()
            });
        } else {
            this.queryData.set({
                stars: {
                    min: e['0'],
                    max: e['1']
                }
            });
        }
    },
    fetchRepos: function() {
        this.collection.fetch({
            data: {
                q: 'stars:' + this.queryData.get('stars').min + '..' + this.queryData.get('stars').max + ' language:' + this.queryData.get('language'),
                sort: 'stars',
                order: 'desc'
            }
        });
    },
    renderBody: function() {
        this.$el.html(_.template($('#Tpl-body').html()));
        $('#app-body-container').html(this.el);
        this.activateAutocomplete();
        this.activateSlider();
    },
    activateSlider: function() {
        var that = this;
        var slider = document.getElementById('slider');
        noUiSlider.create(slider, {
            start: [0, 1000],
            connect: true,
            step: 1,
            range: {
                'min': 0,
                'max': 1000
            },
            format: wNumb({
                decimals: 0
            })
        });
        slider.noUiSlider.on('set', function(e) {
            that.updateSearchData(e);
        });
    },
    activateAutocomplete: function() {
        $.getJSON('https://rawgit.com/ashishsajwan/topgit-sap/gh-pages/data/languages.json', function(json) {
            $('input.autocomplete').autocomplete({
                data: json
            });
        });
    },
    renderReposList: function() {
        this.setHeaderStats();
        var listHtml = '';
        var repoTemplate = _.template($('#Tpl-repo').html());
        _.each(this.collection.models, function(model, key) {
            listHtml += repoTemplate(model.toJSON());
        });
        $('#repo-list-container').html(listHtml);
    },
    setHeaderStats: function() {
        this.headerStats.set({
            totalRepos: this.collection.total_count,
            language: this.queryData.get('language')
        });
    }
})

$(document).ready(function() {
    // create a object of headerstatsModel
    var headerStatsModel = new HeaderStatsModel();
    var queryDataModel = new QueryDataModel();

    // create a object of Headerview
    // which will render header view of app
    var headerView = new HeaderView({
        model: headerStatsModel
    });

    var bodyView = new BodyView({
        // also passing custom data
        headerStats: headerStatsModel,
        queryData: queryDataModel,
        // along with normal collection
        collection: new RepoList()
    });
});
