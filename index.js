var xhr = require("xhr");

for (var key in React.DOM) global[key] = React.DOM[key];

var Search = React.createClass({
    displayName: 'Search',
    getInitialState: function(){
        return {
            active_page: 0,
            search_results: [],
            search_filter_type: "title"
        }
    },
    componentDidMount: function(){
        var st = this.state;
        var self = this;
        function search(){
            var filter_input = document.getElementById("search_filter_text");
            var filter = filter_input && filter_input.value || "*";
            xhr.get("/get_entries_by_"+st.search_filter_type+"/"+encodeURI(filter), function(err, res){
                st.search_results = JSON.parse(res.body);
                self.forceUpdate();
                setTimeout(search, 250);
            });
        }
        setTimeout(search, 1000);
    },
    render: function() {
        var self = this;

        var st = this.state;

        var page_titles = ["Busca", "Catalogação"];

        var search_results = st.search_results.map(function(search_result){
            function select(){
                st.active_page = 1;
                self.forceUpdate();
                setTimeout(function(){
                    document.getElementById("entry_title_input").value = search_result.title;
                    document.getElementById("entry_author_input").value = search_result.author;
                }, 100);
            }
            return div({"className": "search_result"}, [
                div({"className": "search_result_title", "onClick": select},
                    search_result.title),
                div({"className": "search_result_author"},[
                    span({"className": "search_result_author_by"}, "by "),
                    span({"className": "search_result_author_name"}, search_result.author)])]);
        });

        function with_entry(cmd){
            return function(){
                var entry = {
                    title: document.getElementById("entry_title_input").value,
                    author: document.getElementById("entry_author_input").value};
                xhr.post("/"+cmd+"_entry/"+encodeURI(JSON.stringify(entry)), function(req, res){});
                if (cmd === "del") clean_entry();
            }
        }

        function clean_entry(){
            document.getElementById("entry_title_input").value = "";
            document.getElementById("entry_author_input").value = "";
        }

        function select_search_filter_type(e){
            st.search_filter_type = e.target.value;
        }

        var pages = [
            div({"className": "search_page"}, [
                div({"className": "search_filter"}, [
                    select({"className": "search_filter_type", "onChange": select_search_filter_type}, [
                        option({"value": "title"}, "Título"),
                        option({"value": "author"}, "Autoria")]),
                    input({"id": "search_filter_text", "className": "search_filter_text", "key": "search_filter_text"})]),
                div({"className": "search_results_container"}, 
                    div({"className": "search_results"},
                        search_results))]),
            div({"className": "entry_page"}, [
                div({"className": "entry_row"}, [
                    span({"className": "entry_title"}, "Título"),
                    input({"className": "entry_text", "id": "entry_title_input", "key": "entry_title_input"})]),
                div({"className": "entry_row"}, [
                    span({"className": "entry_title"}, "Author"),
                    input({"className": "entry_text", "id": "entry_author_input", "key": "entry_author_input"})]),
                div({"className": "entry_buttons"}, [
                    div({"className": "entry_button_row"}, [
                        input({"type": "submit", "className": "entry_button", "value": "Enviar", "onClick": with_entry("add")}),
                        input({"type": "submit", "className": "entry_button", "value": "Limpar", "onClick": clean_entry})]),
                    div({"className": "entry_button_row"}, [
                        input({"type": "submit", "className": "entry_button", "value": "Editar", "onClick": with_entry("edit")}),
                        input({"type": "submit", "className": "entry_button", "value": "Excluir", "onClick": with_entry("del")})])])])
        ];

        var go_to_next_page = function(){
            st.active_page = (st.active_page+1) % page_titles.length;
            console.log(st);
            self.forceUpdate();
        }

        return div({"className": "page"}, [
            div({"className": "page_title", "onClick": go_to_next_page},
                page_titles[st.active_page]),
            pages[st.active_page]]);
    }
});

window.onload = function(){
    ReactDOM.render(
        React.createElement(Search, {name: "World"}),
        document.getElementById('main'));
};
