import Search from './models/Search';
import Recipe from './models/recipes';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
/**
 * controller file
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
        renderLoader(elements.searchRes);

        try {
            //4. search for recipes
            await state.search.getResults();

            //5. render results on UI
            clearLoader();
            searchView.renderResults(state.search.result)
        } catch (error) {
            alert('Error processing search')
        }
    }

};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

const controlRecipe = async () => {
    //get Id from url 
    const id = window.location.hash.replace('#', '');
    if (id) {
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //hightLight selected search item
        if (state.search) searchView.hightlightSelected(id);

        //

        //create new recipe object 
        state.recipe = new Recipe(id);

        try {
            //get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //render recipes
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (error) {
            alert('Error processing recipe')
        }
    }
};
// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// List controller
const controlList = () => {
    // create a nw list if there is none yet
    if (!state.list) state.list = new List();
    //add each ingredient to the list 
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
};

// handle delete/update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);

        //delete from UI
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        //read data from UI
        const val = parseFloat(e.target.value, 10);
        state.list.updateItem(id, val);
    }
});

// Likes controller
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    if (!state.likes.isLiked(currentID)) {
        //User has not yet liked current recipe
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img,
        )
        //toggle the like button
        likesView.toggleLikeBtn(true);
        //add like to UI like
        likesView.renderLike(newLike);
    } else {
        //User has liked current recipe
        //Remove like from the state
        state.likes.deleteLike(currentID);
        //toggle the like button
        likesView.toggleLikeBtn(false);
        //delete like from UI like
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLike());
};

//restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    //restore likes
    state.likes.readStorage();
    //toggle like menu
    likesView.toggleLikeMenu(state.likes.getNumLike());
    //render the existing lieks
    state.likes.likes.forEach(like => likesView.renderLike(like));

});

//handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    // .button-decrease * means any child of button-decrease
    if (e.target.matches('.button-decrease, .button-decrease *')) {
        //decrease button clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.button-increase, .button-increase *')) {
        //increase button clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // add 
        controlLike();
    }
});

