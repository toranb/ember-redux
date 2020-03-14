import { test, module } from 'qunit';
import { visit, click, find, findAll, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import ajax from '../helpers/ajax';

var oneUpdated = 0, oneFakeUpdated = 0, twoUpdated = 0, fourUpdated = 0, fiveUpdated = 0;

module('Acceptance | rerender test', function(hooks) {
  setupApplicationTest(hooks);

  test('dispatchToActions will provide `this` context that is the component instance (when not using [phat]Arrow function)', async function(assert) {
    ajax('/api/lists', 'GET', 200, [{id: 1, name: 'one', reviews: [{rating: 5}, {rating: 5}]}, {id: 2, name: 'two', reviews: [{rating: 3}, {rating: 1}]}]);
    await visit('/lists');
    assert.equal(currentURL(), '/lists');
    assert.equal(find('.fake-contextt').textContent, '');
    await click('.btn-contextt');
    assert.equal(currentURL(), '/lists');
    assert.equal(find('.fake-contextt').textContent, 'contextt ... abc123');
  });

  test('should only rerender when connected component is listening for each state used to compute', async function(assert) {
    ajax('/api/lists', 'GET', 200, [{id: 1, name: 'one', reviews: [{rating: 5}, {rating: 5}]}, {id: 2, name: 'two', reviews: [{rating: 3}, {rating: 1}]}]);
    await visit('/lists');
    assert.equal(currentURL(), '/lists');
    assert.equal(findAll('.list-item-one .item-name').length, 2);
    assert.equal(findAll('.list-item-one .item-rating').length, 4);
    assert.equal(find('.list-item-one .fake-value').textContent, 1);
    assert.equal(findAll('.list-item-two .item-name').length, 2);
    assert.equal(findAll('.list-item-two .item-rating').length, 4);
    assert.equal(findAll('.list-item-three .item-name').length, 2);
    assert.equal(findAll('.list-item-three .item-rating').length, 4);
    assert.equal(find('.unrelated-one').textContent, '');
    assert.equal(find('.random-one').textContent, '');
    assert.equal(oneUpdated, 0);
    assert.equal(twoUpdated, 0);
    var componentOne = this.owner.lookup('component:list-one');
    var componentTwo = this.owner.lookup('component:list-two');
    var componentFour = this.owner.lookup('component:unrelated-one');
    var componentFive = this.owner.lookup('component:random-one');
    /* eslint-disable ember/no-observers */
    componentOne.addObserver('items', function() { this.get('items'); oneUpdated++; });
    componentOne.addObserver('fake', function() { this.get('fake'); oneFakeUpdated++; });
    componentTwo.addObserver('items', function() { this.get('items'); twoUpdated++; });
    componentFour.addObserver('unrelated', function() { this.get('unrelated'); fourUpdated++; });
    componentFive.addObserver('random', function() { this.get('random'); fiveUpdated++; });
    /* eslint-disable ember/no-observers */
    await click('.filter-list-one');
    assert.equal(currentURL(), '/lists');
    assert.equal(findAll('.list-item-one .item-name').length, 1);
    assert.equal(findAll('.list-item-one .item-rating').length, 2);
    assert.equal(find('.list-item-one .fake-value').textContent, 1);
    assert.equal(findAll('.list-item-two .item-name').length, 1);
    assert.equal(findAll('.list-item-two .item-rating').length, 2);
    assert.equal(findAll('.list-item-three .item-name').length, 1);
    assert.equal(findAll('.list-item-three .item-rating').length, 2);
    assert.equal(find('.unrelated-one').textContent, '');
    assert.equal(find('.random-one').textContent, '');
    ajax('/api/lists', 'GET', 200, [{id: 1, name: 'one', reviews: [{rating: 5}, {rating: 5}, {rating: 1}]}, {id: 2, name: 'two', reviews: [{rating: 3}, {rating: 1}]}]);
    await click('.refresh-list:nth-of-type(1)');
    assert.equal(currentURL(), '/lists');
    assert.equal(findAll('.list-item-one .item-name').length, 0);
    assert.equal(find('.list-item-one .fake-value').textContent, 1);
    assert.equal(findAll('.list-item-two .item-name').length, 0);
    assert.equal(findAll('.list-item-three .item-name').length, 0);
    assert.equal(find('.unrelated-one').textContent, '');
    assert.equal(find('.random-one').textContent, '');
    await click('.filter-list-two');
    assert.equal(currentURL(), '/lists');
    assert.equal(findAll('.list-item-one .item-name').length, 2);
    assert.equal(findAll('.list-item-one .item-rating').length, 5);
    assert.equal(find('.list-item-one .fake-value').textContent, 1);
    assert.equal(find('.list-item-one .item-rating:nth-of-type(3)').textContent, '1');
    assert.equal(findAll('.list-item-two .item-name').length, 2);
    assert.equal(findAll('.list-item-two .item-rating').length, 5);
    assert.equal(find('.list-item-two .item-rating:nth-of-type(3)').textContent, '1');
    assert.equal(findAll('.list-item-three .item-name').length, 2);
    assert.equal(findAll('.list-item-three .item-rating').length, 5);
    assert.equal(find('.list-item-three .fake-value').textContent, 1);
    assert.equal(find('.unrelated-one').textContent, '');
    assert.equal(find('.random-one').textContent, '');
    await click('.unrelated-change:nth-of-type(1)');
    assert.equal(currentURL(), '/lists');
    assert.equal(findAll('.list-item-one .item-name').length, 2);
    assert.equal(findAll('.list-item-one .item-rating').length, 5);
    assert.equal(find('.list-item-one .fake-value').textContent, 1);
    assert.equal(find('.list-item-one .item-rating:nth-of-type(3)').textContent, '1');
    assert.equal(findAll('.list-item-two .item-name').length, 2);
    assert.equal(findAll('.list-item-two .item-rating').length, 5);
    assert.equal(find('.list-item-two .item-rating:nth-of-type(3)').textContent, '1');
    assert.equal(findAll('.list-item-three .item-name').length, 2);
    assert.equal(findAll('.list-item-three .item-rating').length, 5);
    assert.equal(find('.list-item-three .fake-value').textContent, 1);
    assert.notEqual(find('.unrelated-one').textContent, '');
    assert.equal(find('.random-one').textContent, '');
    ajax('/api/lists', 'GET', 200, [{id: 1, name: 'one', reviews: [{rating: 5}, {rating: 5}, {rating: 5}]}, {id: 2, name: 'two', reviews: [{rating: 3}, {rating: 1}]}]);
    await click('.refresh-list:nth-of-type(1)');
    assert.equal(currentURL(), '/lists');
    assert.equal(findAll('.list-item-one .item-name').length, 2);
    assert.equal(findAll('.list-item-one .item-rating').length, 5);
    assert.equal(find('.list-item-one .fake-value').textContent, 1);
    assert.equal(find('.list-item-one .item-rating:nth-of-type(3)').textContent, '5');
    assert.equal(findAll('.list-item-two .item-name').length, 2);
    assert.equal(findAll('.list-item-two .item-rating').length, 5);
    assert.equal(find('.list-item-two .item-rating:nth-of-type(3)').textContent, '5');
    assert.equal(findAll('.list-item-three .item-name').length, 2);
    assert.equal(findAll('.list-item-three .item-rating').length, 5);
    assert.equal(find('.list-item-three .fake-value').textContent, 1);
    assert.notEqual(find('.unrelated-one').textContent, '');
    assert.equal(find('.random-one').textContent, '');
    await click('.random-change:nth-of-type(1)');
    assert.equal(currentURL(), '/lists');
    assert.equal(findAll('.list-item-one .item-name').length, 2);
    assert.equal(findAll('.list-item-one .item-rating').length, 5);
    assert.equal(find('.list-item-one .fake-value').textContent, 1);
    assert.equal(findAll('.list-item-two .item-name').length, 2);
    assert.equal(findAll('.list-item-two .item-rating').length, 5);
    assert.equal(findAll('.list-item-three .item-name').length, 2);
    assert.equal(findAll('.list-item-three .item-rating').length, 5);
    assert.equal(find('.list-item-three .fake-value').textContent, 1);
    assert.notEqual(find('.unrelated-one').textContent, '');
    assert.notEqual(find('.random-one').textContent, '');
    assert.equal(oneUpdated, 4);
    assert.equal(oneFakeUpdated, 0);
    assert.equal(twoUpdated, 4);
    assert.equal(fourUpdated, 1);
    assert.equal(fiveUpdated, 1);
    await click('.fake-change:nth-of-type(1)');
    await click('.fake-change:nth-of-type(1)');
    await click('.fake-change:nth-of-type(1)');
    await click('.fake-change:nth-of-type(1)');
    assert.equal(currentURL(), '/lists');
    assert.equal(findAll('.list-item-one .item-name').length, 2);
    assert.equal(findAll('.list-item-one .item-rating').length, 5);
    assert.equal(find('.list-item-one .fake-value').textContent, 5);
    assert.equal(findAll('.list-item-two .item-name').length, 2);
    assert.equal(findAll('.list-item-two .item-rating').length, 5);
    assert.equal(findAll('.list-item-three .item-name').length, 2);
    assert.equal(findAll('.list-item-three .item-rating').length, 5);
    assert.equal(find('.list-item-three .fake-value').textContent, 5);
    assert.notEqual(find('.unrelated-one').textContent, '');
    assert.notEqual(find('.random-one').textContent, '');
    assert.equal(oneUpdated, 4);
    assert.equal(oneFakeUpdated, 4);
    assert.equal(twoUpdated, 4);
    assert.equal(fourUpdated, 1);
    assert.equal(fiveUpdated, 1);
  });
});
