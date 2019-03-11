import { mount, shallow } from 'enzyme'
import { createBrowserHistory } from 'history'
import React from 'react'
import { Route, Router } from 'react-router-dom'

import { withQueryRouter } from '../withQueryRouter'

const Test = () => null
const QueryRouterTest = withQueryRouter(Test)

describe('src | components | pages | hocs | withQueryRouter', () => {
  describe('snapshot', () => {
    it('should match snapshot', () => {
      // when
      const wrapper = shallow(<QueryRouterTest />)

      // then
      expect(wrapper).toBeDefined()
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('functions ', () => {
    describe('parse', () =>
      it('withQueryRouter passes a query.parse function that formats the location search string into in a params object', () => {
        // given
        const history = createBrowserHistory()
        history.push('/test?page=1&keywords=test&orderBy=offer.id+desc')

        // when
        const wrapper = mount(
          <Router history={history}>
            <Route path="/test">
              <QueryRouterTest />
            </Route>
          </Router>
        )

        // then
        const { query } = wrapper.find('Test').props()
        const expectedParams = { 'keywords': 'test', page: '1', 'orderBy': 'offer.id desc' }
        expect(query.parse()).toEqual(expectedParams)
      }))

    describe('clear', () =>
      it('withQueryRouter passes query.clear function that erases the location.search string', () => {
        // given
        const history = createBrowserHistory()
        history.push('/test?page=1&keywords=test')
        const wrapper = mount(
          <Router history={history}>
            <Route path="/test">
              <QueryRouterTest />
            </Route>
          </Router>
        )
        const { query } = wrapper.find('Test').props()

        // when
        query.clear()

        // then
        const expectedParams = {}
        expect(query.parse()).toEqual(expectedParams)
      }))

    describe('change', () =>
      it('withQueryRouter passes query.change that overwrites the location.search', () => {
        // given
        const history = createBrowserHistory()
        history.push('/test?page=1&keywords=test')
        const wrapper = mount(
          <Router history={history}>
            <Route path="/test">
              <QueryRouterTest />
            </Route>
          </Router>
        )
        const { query } = wrapper.find('Test').props()

        // when
        query.change({ 'keywords': null, page: 2 })

        // then
        const expectedParams = { page: '2' }
        expect(query.parse()).toEqual(expectedParams)
      }))

    describe('add', () =>
      it('withQueryRouter passes query.add function that concatenates values in the location.search', () => {
        // given
        const history = createBrowserHistory()
        history.push('/test?jours=0,1&keywords=test')
        const wrapper = mount(
          <Router history={history}>
            <Route path="/test">
              <QueryRouterTest />
            </Route>
          </Router>
        )
        const { query } = wrapper.find('Test').props()

        // when
        query.add('jours', '2')

        // then
        const expectedParams = { jours: '0,1,2', 'keywords': 'test' }
        expect(query.parse()).toEqual(expectedParams)
      }))

    describe('remove', () =>
      it('withQueryRouter passes query.remove function that pops values from the location.search', () => {
        // given
        const history = createBrowserHistory()
        history.push('/test?jours=0,1&keywords=test')
        const wrapper = mount(
          <Router history={history}>
            <Route path="/test">
              <QueryRouterTest />
            </Route>
          </Router>
        )
        const { query } = wrapper.find('Test').props()

        // when
        query.remove('jours', '1')

        // then
        const expectedParams = { jours: '0', 'keywords': 'test' }
        expect(query.parse()).toEqual(expectedParams)
      }))
  })
})
