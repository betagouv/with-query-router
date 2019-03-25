import { mount, shallow } from 'enzyme'
import { createBrowserHistory } from 'history'
import React from 'react'
import { Route, Router } from 'react-router-dom'

import { withQueryRouter } from '../withQueryRouter'

const Test = () => null
const QueryRouterTest = withQueryRouter()(Test)
const FrenchQueryRouterTest = withQueryRouter({
  editKey: 'modifie',
  mapper: {
    'lieu': "venue"
  },
  newKey: /nouveau|nouvelle/,
})(Test)

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
    describe('parse', () => {
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
        const expectedParams = {
          keywords: 'test',
          orderBy: 'offer.id desc',
          page: '1',
        }
        expect(query.parse()).toEqual(expectedParams)
      })
    })

    describe('translate', () => {
      it('withQueryRouter passes query.translate function that transforms queryParams into mapped params', () => {
        // given
        const history = createBrowserHistory()
        history.push('/test?lieu=AE')
        const wrapper = mount(
          <Router history={history}>
            <Route path="/test">
              <FrenchQueryRouterTest />
            </Route>
          </Router>
        )
        const { query } = wrapper.find('Test').props()

        // when
        const translatedQueryParams = query.translate()

        // then
        const expectedTranslatedQueryParams = {
          venue: "AE"
        }
        expect(translatedQueryParams).toEqual(expectedTranslatedQueryParams)
      })
    })

    describe('clear', () => {
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
      })
    })

    describe('change', () => {
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
      })
    })

    describe('add', () => {
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
      })
    })

    describe('remove', () => {
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
      })
    })

    describe('context', () => {
      describe('pathname context', () => {
        it('withQueryRouter gives query.context for creating an entity giving info in the pathname', () => {
          // given
          const history = createBrowserHistory()
          history.push('/tests/new')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/tests/:context">
                <QueryRouterTest />
              </Route>
            </Router>
          )
          const { query } = wrapper.find('Test').props()

          // when
          const context = query.context()

          // then
          const expectedContext = {
            isEditEntity: false,
            isNewEntity: true,
            method: 'POST',
            originLocationString: '/tests/',
            readOnly: false
          }
          expect(context).toEqual(expectedContext)
        })

        it('withQueryRouter gives context for editing an entity giving info in the pathname', () => {
          // given
          const history = createBrowserHistory()
          history.push('/tests/AE?edit')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/tests/:context">
                <QueryRouterTest />
              </Route>
            </Router>
          )
          const { query } = wrapper.find('Test').props()

          // when
          const context = query.context()

          // then
          const expectedContext = {
            isEditEntity: true,
            isNewEntity: false,
            method: 'PATCH',
            originLocationString: '/tests/AE',
            readOnly: false
          }
          expect(context).toEqual(expectedContext)
        })

        it('withQueryRouter gives context for read only an entity giving info in the pathname', () => {
          // given
          const history = createBrowserHistory()
          history.push('/tests/AE')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/tests/:context">
                <QueryRouterTest />
              </Route>
            </Router>
          )
          const { query } = wrapper.find('Test').props()

          // when
          const context = query.context()

          // then
          const expectedContext = {
            isEditEntity: false,
            isNewEntity: false,
            method: null,
            readOnly: true
          }
          expect(context).toEqual(expectedContext)
        })
      })

      describe('search context', () => {
        it('withQueryRouter gives context for creating an entity giving info in the search', () => {
          // given
          const history = createBrowserHistory()
          history.push('/foo?test=new')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/foo">
                <QueryRouterTest />
              </Route>
            </Router>
          )
          const { query } = wrapper.find('Test').props()

          // when
          const context = query.context('test')

          // then
          const expectedContext = {
            isEditEntity: false,
            isNewEntity: true,
            key: 'test',
            method: 'POST',
            originLocationString: '/foo',
            readOnly: false
          }
          expect(context).toEqual(expectedContext)
        })

        it('withQueryRouter gives context for editing an entity giving info in the search', () => {
          // given
          const history = createBrowserHistory()
          history.push('/foo?testAE=edit')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/foo">
                <QueryRouterTest />
              </Route>
            </Router>
          )
          const { query } = wrapper.find('Test').props()

          // when
          const context = query.context('test')

          // then
          const expectedContext = {
            isEditEntity: true,
            isNewEntity: false,
            key: 'test',
            method: 'PATCH',
            originLocationString: '/foo',
            readOnly: false
          }
          expect(context).toEqual(expectedContext)
        })

        it('withQueryRouter gives context for read only an entity giving info in the search', () => {
          // given
          const history = createBrowserHistory()
          history.push('/foo')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/foo">
                <QueryRouterTest />
              </Route>
            </Router>
          )
          const { query } = wrapper.find('Test').props()

          // when
          const context = query.context('test')

          // then
          const expectedContext = {
            isEditEntity: false,
            isNewEntity: false,
            key: 'test',
            method: null,
            readOnly: true
          }
          expect(context).toEqual(expectedContext)
        })
      })

      describe('french context', () => {
        it('withQueryRouter gives flexible french pathname context', () => {
          // given
          const history = createBrowserHistory()
          history.push('/beaujolais/nouveau')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/beaujolais/:context">
                <FrenchQueryRouterTest />
              </Route>
            </Router>
          )
          let props = wrapper.find('Test').props()

          // when
          let context = props.query.context()

          // then
          let expectedContext = {
            isEditEntity: false,
            isNewEntity: true,
            method: 'POST',
            originLocationString: '/beaujolais',
            readOnly: false
          }
          expect(context).toEqual(expectedContext)


          // given
          history.push('/beaujolais/AE?modifie')
          props = wrapper.find('Test').props()

          // when
          context = props.query.context()

          // then
          expectedContext = {
            isEditEntity: true,
            isNewEntity: false,
            method: 'PATCH',
            originLocationString: '/beaujolais/AE',
            readOnly: false
          }
          expect(context).toEqual(expectedContext)

          // given
          history.push('/beaujolais')
          props = wrapper.find('Test').props()

          // when
          context = props.query.context()

          // then
          expectedContext = {
            isEditEntity: false,
            isNewEntity: false,
            method: null,
            readOnly: true
          }
          expect(context).toEqual(expectedContext)
        })

        it('withQueryRouter gives flexible french search context', () => {
          // given
          const history = createBrowserHistory()
          history.push('/foo?beaujolais=nouveau')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/foo">
                <FrenchQueryRouterTest />
              </Route>
            </Router>
          )
          let props = wrapper.find('Test').props()

          // when
          let context = props.query.context('beaujolais')

          // then
          let expectedContext = {
            isEditEntity: false,
            isNewEntity: true,
            key: 'beaujolais',
            method: 'POST',
            originLocationString: '/foo',
            readOnly: false
          }
          expect(context).toEqual(expectedContext)


          // given
          history.push('/foo?beaujolaisAE=modifie')
          props = wrapper.find('Test').props()

          // when
          context = props.query.context('beaujolais')

          // then
          expectedContext = {
            isEditEntity: true,
            isNewEntity: false,
            key: 'beaujolais',
            method: 'PATCH',
            originLocationString: '/foo',
            readOnly: false
          }
          expect(context).toEqual(expectedContext)

          // given
          history.push('/foo')
          props = wrapper.find('Test').props()

          // when
          context = props.query.context('beaujolais')

          // then
          expectedContext = {
            isEditEntity: false,
            isNewEntity: false,
            key: 'beaujolais',
            method: null,
            readOnly: true
          }
          expect(context).toEqual(expectedContext)
        })
      })
    })
  })
})
