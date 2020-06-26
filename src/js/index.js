import Search from './models/Search';
import * as searchView from './views/searchView';
import { elements } from './views/base';
/**
 * Global state of the app
 * 1. search object
 * 2. current recipe object
 * 3. shopping list object
 * 4. linked recipe
 * 
 */
const state = {};

const controlSearch = async () => {
    //1. get query from view
    const query = searchView.getInput();

    if (query) {
        //2. create a new object
        state.search = new Search(query);

        //3. prepare UI for results
        searchView.clearInput();
        searchView.clearResults();

        //4. search for recipes
        await state.search.getResults();

        //5. render results on UI
        searchView.renderResults(state.search.result)

    }

}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


// const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);