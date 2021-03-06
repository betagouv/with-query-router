import { mount, shallow } from 'enzyme'
import { createBrowserHistory } from 'history'
import React, { Fragment
} from 'react'
import { Route, Router } from 'react-router-dom'

import { FrenchQueryRouterTest, QueryRouterTest } from './utils'

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
      it('withQueryRouter passes query.translate function that transforms queryParams into transltaed params thanks to a mapper', done => {
        // given
        const history = createBrowserHistory()
        history.push('/test?lieu=AE')
        const wrapper = mount(
          <Router history={history}>
            <Route path="/test">
              <FrenchQueryRouterTest onUpdate={onUpdate} />
            </Route>
          </Router>
        )
        let props = wrapper.find('Test').props()

        // when
        const translatedQueryParams = props.query.translate()

        // then
        const expectedTranslatedQueryParams = {
          venue: "AE"
        }
        expect(translatedQueryParams).toEqual(expectedTranslatedQueryParams)

        // when
        props.query.change({ venue: "BF" })

        // then
        function onUpdate(props, prevProps) {
          const { location, query } = props
          const { pathname, search } = location
          const queryParams = query.parse()
          const translatedQueryParams = query.translate()

          props = wrapper.find('Test').props()
          const expectedQueryParams = {
            lieu: "BF"
          }
          const expectedTranslatedQueryParams = {
            venue: "BF"
          }
          expect(prevProps.location.pathname).toEqual('/test')
          expect(prevProps.location.search).toEqual('?lieu=AE')
          expect(pathname).toEqual('/test')
          expect(search).toEqual('?lieu=BF')
          expect(queryParams).toEqual(expectedQueryParams)
          expect(translatedQueryParams).toEqual(expectedTranslatedQueryParams)

          done()
        }

      })
    })

    describe('clear', () => {
      it('withQueryRouter passes query.clear function that erases the location.search string', done => {
        // given
        const history = createBrowserHistory()
        history.push('/test?page=1&keywords=test')
        const wrapper = mount(
          <Router history={history}>
            <Route path="/test">
              <QueryRouterTest onUpdate={onUpdate}/>
            </Route>
          </Router>
        )
        const { query } = wrapper.find('Test').props()

        // when
        query.clear()

        // then
        function onUpdate(props, prevProps) {
          const { location, query } = props
          const { pathname, search } = location
          const expectedParams = {}

          expect(prevProps.location.pathname).toEqual('/test')
          expect(prevProps.location.search).toEqual('?page=1&keywords=test')
          expect(pathname).toEqual('/test')
          expect(search).toEqual('')
          expect(query.parse()).toEqual(expectedParams)

          done()
        }
      })
    })

    describe('change', () => {
      it('withQueryRouter passes query.change that overwrites the location.search', done => {
        // given
        const history = createBrowserHistory()
        history.push('/test?page=1&keywords=test')
        const wrapper = mount(
          <Router history={history}>
            <Route path="/test">
              <QueryRouterTest onUpdate={onUpdate}/>
            </Route>
          </Router>
        )
        const { query } = wrapper.find('Test').props()

        // when
        query.change({ 'keywords': null, page: 2 })

        // then
        function onUpdate(props, prevProps) {
          const { location, query } = props
          const { pathname, search } = location
          const expectedParams = { page: '2' }

          expect(prevProps.location.pathname).toEqual('/test')
          expect(prevProps.location.search).toEqual('?page=1&keywords=test')
          expect(pathname).toEqual('/test')
          expect(search).toEqual('?page=2')
          expect(query.parse()).toEqual(expectedParams)

          done()
        }
      })
    })

    describe('add', () => {
      it('withQueryRouter passes query.add function that concatenates values in the location.search', done => {
        // given
        const history = createBrowserHistory()
        history.push('/test?jours=0,1&keywords=test')
        const wrapper = mount(
          <Router history={history}>
            <Route path="/test">
              <QueryRouterTest onUpdate={onUpdate} />
            </Route>
          </Router>
        )
        const { query } = wrapper.find('Test').props()

        // when
        query.add('jours', '2')

        // then
        function onUpdate(props, prevProps) {
          const { location, query } = props
          const { pathname, search } = location

          const expectedParams = { jours: '0,1,2', 'keywords': 'test' }
          expect(prevProps.location.pathname).toEqual('/test')
          expect(prevProps.location.search).toEqual('?jours=0,1&keywords=test')
          expect(pathname).toEqual('/test')
          expect(search).toEqual('?jours=0%2C1%2C2&keywords=test')
          expect(query.parse()).toEqual(expectedParams)

          done()
        }
      })
    })

    describe('remove', () => {
      it('withQueryRouter passes query.remove function that pops values from the location.search', done => {
        // given
        const history = createBrowserHistory()
        history.push('/test?jours=0,1&keywords=test')
        const wrapper = mount(
          <Router history={history}>
            <Route path="/test">
              <QueryRouterTest onUpdate={onUpdate} />
            </Route>
          </Router>
        )
        const { query } = wrapper.find('Test').props()

        // when
        query.remove('jours', '1')

        // then
        function onUpdate(props, prevProps) {
          const { location, query } = props
          const { pathname, search } = location
          const expectedParams = { jours: '0', 'keywords': 'test' }

          expect(prevProps.location.pathname).toEqual('/test')
          expect(prevProps.location.search).toEqual('?jours=0,1&keywords=test')
          expect(pathname).toEqual('/test')
          expect(search).toEqual('?jours=0&keywords=test')
          expect(query.parse()).toEqual(expectedParams)

          done()
        }
      })
    })

    describe('context', () => {
      describe('monoitem pathname context', () => {
        it('withQueryRouter gives query.changeToCreation and query.context for creating an entity given info in the pathname', done => {
          // given
          const history = createBrowserHistory()
          history.push('/tests')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/tests/:context">
                <QueryRouterTest onUpdate={onUpdate} />
              </Route>
            </Router>
          )
          const { location, query } = wrapper.find('Test').props()

          // when
          query.changeToCreation()

          // then
          function onUpdate(props, prevProps) {
            const { location, query } = props
            const { pathname, search } = location
            const context = query.context()

            expect(pathname).toEqual('/tests/creation')
            expect(prevProps.location.pathname).toEqual('/tests')
            const expectedContext = {
              isCreatedEntity: true,
              isModifiedEntity: false,
              method: 'POST',
              readOnly: false
            }
            expect(context).toEqual(expectedContext)

            done()
          }

        })

        it('withQueryRouter gives query.changeToModification and query.context for modifying an entity given info in the pathname', done => {
          // given
          const history = createBrowserHistory()
          history.push('/tests/AE')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/tests/:context">
                <QueryRouterTest onUpdate={onUpdate}/>
              </Route>
            </Router>
          )
          const { query } = wrapper.find('Test').props()

          // when
          query.changeToModification()

          // then
          function onUpdate(props, prevProps) {
            const { location, query } = props
            const { pathname, search } = location
            const context = query.context()

            const expectedContext = {
              isModifiedEntity: true,
              isCreatedEntity: false,
              method: 'PATCH',
              readOnly: false
            }
            expect(prevProps.location.pathname).toEqual('/tests/AE')
            expect(prevProps.location.search).toEqual('')
            expect(pathname).toEqual('/tests/AE')
            expect(search).toEqual('?modification')
            expect(context).toEqual(expectedContext)

            done()
          }
        })

        it('withQueryRouter gives query.changeToReadOnly and query.context for reading only a created entity given info in the pathname', done => {
          // given
          const history = createBrowserHistory()
          history.push('/tests/creation')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/tests/:context">
                <QueryRouterTest onUpdate={onUpdate} />
              </Route>
            </Router>
          )
          const { query } = wrapper.find('Test').props()

          // when
          query.changeToReadOnly({ foo: 'bar' })

          // then
          function onUpdate(props, prevProps) {
            const { location, query } = props
            const { pathname, search } = location
            const context = query.context()

            const expectedContext = {
              isCreatedEntity: false,
              isModifiedEntity: false,
              method: null,
              readOnly: true
            }
            expect(prevProps.location.pathname).toEqual('/tests/creation')
            expect(prevProps.location.search).toEqual('')
            expect(pathname).toEqual('/tests')
            expect(search).toEqual('?foo=bar')
            expect(context).toEqual(expectedContext)

            done()
          }
        })

        it('withQueryRouter gives query.changeToReadOnly and query.context for reading only a modified entity given info in the pathname', done => {
          // given
          const history = createBrowserHistory()
          history.push('/tests/AE?modification')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/tests/:context">
                <QueryRouterTest onUpdate={onUpdate} />
              </Route>
            </Router>
          )
          const { query } = wrapper.find('Test').props()

          // when
          query.changeToReadOnly()

          // then
          function onUpdate(props, prevProps) {
            const { location, query } = props
            const { pathname, search } = location
            const context = query.context()

            const expectedContext = {
              isCreatedEntity: false,
              isModifiedEntity: false,
              method: null,
              readOnly: true
            }
            expect(prevProps.location.pathname).toEqual('/tests/AE')
            expect(prevProps.location.search).toEqual('?modification')
            expect(pathname).toEqual('/tests/AE')
            expect(search).toEqual('')
            expect(context).toEqual(expectedContext)

            done()
          }
        })
      })

      describe('multiitem pathname context', () => {
        it('withQueryRouter gives query.changeToCreation and query.context for creating an entity given info in the pathname', done => {
          // given
          const history = createBrowserHistory()
          history.push('/tests')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/tests/:id?">
                <Fragment>
                  <QueryRouterTest onUpdate={onUpdate} />
                  <QueryRouterTest id="AE" onUpdate={onUpdate} />
                </Fragment>
              </Route>
            </Router>
          )
          const { location, query } = wrapper.find('Test').first().props()

          // when
          query.changeToCreation()

          // then
          function onUpdate(props, prevProps) {
            const { id, location, query } = props
            const { pathname, search } = location
            const context = query.context({ id })

            expect(prevProps.location.pathname).toEqual('/tests')
            expect(pathname).toEqual('/tests/creation')

            if (!id) {
              const expectedContext = {
                isCreatedEntity: true,
                isModifiedEntity: false,
                method: 'POST',
                readOnly: false
              }
              expect(context).toEqual(expectedContext)
            } else {
              const expectedContext = {
                isCreatedEntity: false,
                isModifiedEntity: false,
                readOnly: true
              }
              expect(context).toEqual(expectedContext)
            }

            done()
          }
        })
        it('withQueryRouter gives query.changeToModification and query.context for modifying an entity given info in the pathname', done => {
          // given
          const history = createBrowserHistory()
          history.push('/tests')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/tests/:id?">
                <Fragment>
                  <QueryRouterTest id="AE" onUpdate={onUpdate} />
                  <QueryRouterTest id="BF" onUpdate={onUpdate} />
                </Fragment>
              </Route>
            </Router>
          )
          const { location, query } = wrapper.find('Test').first().props()

          // when
          query.changeToModification(null, { id: "AE" })

          // then
          function onUpdate(props, prevProps) {
            const { id, location, query } = props
            const { pathname, search } = location
            const context = query.context({ id })

            expect(prevProps.location.pathname).toEqual('/tests')
            expect(prevProps.location.search).toEqual('')
            expect(pathname).toEqual('/tests/AE')
            expect(search).toEqual('?modification')

            if (id === "AE") {
              const expectedContext = {
                isCreatedEntity: false,
                isModifiedEntity: true,
                method: 'PATCH',
                readOnly: false
              }
              expect(context).toEqual(expectedContext)
            } else {
              const expectedContext = {
                isCreatedEntity: false,
                isModifiedEntity: false,
                readOnly: true
              }
              expect(context).toEqual(expectedContext)
            }

            done()
          }
        })

        it('withQueryRouter gives query.changeToReadOnly and query.context for read only from a created entity given info in the pathname', done => {
          // given
          const history = createBrowserHistory()
          history.push('/tests/creation')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/tests/:id?">
                <Fragment>
                  <QueryRouterTest onUpdate={onUpdate} />
                  <QueryRouterTest id="BF" onUpdate={onUpdate} />
                </Fragment>
              </Route>
            </Router>
          )
          const { location, query } = wrapper.find('Test').first().props()

          // when
          query.changeToReadOnly(null)

          // then
          function onUpdate(props, prevProps) {
            const { id, location, query } = props
            const { pathname, search } = location
            const context = query.context({ id })

            expect(prevProps.location.pathname).toEqual('/tests/creation')
            expect(pathname).toEqual('/tests')

            const expectedContext = {
              isCreatedEntity: false,
              isModifiedEntity: false,
              method: null,
              readOnly: true
            }
            expect(context).toEqual(expectedContext)

            done()
          }
        })

        it('withQueryRouter gives query.changeToReadOnly and query.context for read only from a modified entity given info in the pathname', done => {
          // given
          const history = createBrowserHistory()
          history.push('/tests/AE?modification')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/tests/:id?">
                <Fragment>
                  <QueryRouterTest id="AE" onUpdate={onUpdate} />
                  <QueryRouterTest id="BF" onUpdate={onUpdate} />
                </Fragment>
              </Route>
            </Router>
          )
          const { location, query } = wrapper.find('Test').first().props()

          // when
          query.changeToReadOnly(null, { id: "AE" })

          // then
          function onUpdate(props, prevProps) {
            const { id, location, query } = props
            const { pathname, search } = location
            const context = query.context({ id })

            expect(prevProps.location.pathname).toEqual('/tests/AE')
            expect(prevProps.location.search).toEqual('?modification')
            expect(pathname).toEqual('/tests')
            expect(search).toEqual('')

            const expectedContext = {
              isCreatedEntity: false,
              isModifiedEntity: false,
              method: null,
              readOnly: true
            }
            expect(context).toEqual(expectedContext)

            done()
          }
        })
      })

      describe('search context', () => {
        it('withQueryRouter gives query.changeToCreation and query.context for creating an entity given info in the search', done => {
          // given
          const history = createBrowserHistory()
          history.push('/foo?fee')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/foo">
                <Fragment>
                  <QueryRouterTest onUpdate={onUpdate} />
                  <QueryRouterTest id='AE' onUpdate={onUpdate} />
                </Fragment>
              </Route>
            </Router>
          )
          const { query } = wrapper.find('Test').first().props()

          // when
          query.changeToCreation({ foo: 'bar' }, { key: 'test' })

          // then
          function onUpdate(props, prevProps) {
            const { id, location, query } = props
            const { pathname, search } = location
            const context = query.context({ id, key: 'test' })

            if (!id) {
              const expectedContext = {
                isCreatedEntity: true,
                isModifiedEntity: false,
                key: 'test',
                method: 'POST',
                readOnly: false
              }
              expect(prevProps.location.pathname).toEqual('/foo')
              expect(prevProps.location.search).toEqual('?fee')
              expect(pathname).toEqual('/foo')
              expect(search).toEqual('?fee&foo=bar&test=creation')
              expect(context).toEqual(expectedContext)
            } else if (id === 'AE') {
              const expectedContext = {
                isCreatedEntity: false,
                isModifiedEntity: false,
                key: 'test',
                method: null,
                readOnly: true
              }
              expect(context).toEqual(expectedContext)
            }

            done()
          }
        })

        it('withQueryRouter gives query.changeToModification and query.context for modifying an entity given info in the search', done => {
          // given
          const history = createBrowserHistory()
          history.push('/foo')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/foo">
                <Fragment>
                  <QueryRouterTest id='AE' onUpdate={onUpdate} />
                  <QueryRouterTest id='BF' onUpdate={onUpdate} />
                </Fragment>
              </Route>
            </Router>
          )
          const { query } = wrapper.find('Test').find({ id: 'AE' }).props()

          // when
          query.changeToModification(null, { id: 'AE', key: 'test' })

          // then
          function onUpdate(props, prevProps) {
            const { id, location, query } = props
            const { pathname, search } = location
            const context = query.context({ id, key: 'test' })

            if (id === 'AE') {
              const expectedContext = {
                isModifiedEntity: true,
                isCreatedEntity: false,
                key: 'test',
                method: 'PATCH',
                readOnly: false
              }
              expect(prevProps.location.pathname).toEqual('/foo')
              expect(prevProps.location.search).toEqual('')
              expect(pathname).toEqual('/foo')
              expect(search).toEqual('?testAE=modification')
              expect(context).toEqual(expectedContext)
            } else if (id === 'BF') {
              const expectedContext = {
                isModifiedEntity: false,
                isCreatedEntity: false,
                key: 'test',
                method: null,
                readOnly: true
              }
              expect(context).toEqual(expectedContext)
            }

            done()
          }
        })

        it('withQueryRouter gives query.changeToReadOnly and query.context for reading only an entity given info in the search', done => {
          // given
          const history = createBrowserHistory()
          history.push('/foo')
          const wrapper = mount(
            <Router history={history}>
              <Route path="/foo">
                <QueryRouterTest onUpdate={onUpdate} />
              </Route>
            </Router>
          )
          const { query } = wrapper.find('Test').props()

          // when
          query.changeToReadOnly(null, { key: 'test' })

          // then
          function onUpdate(props, prevProps) {
            const { location, query } = props
            const { pathname, search } = location
            const context = query.context({ key: 'test' })
            const expectedContext = {
              isModifiedEntity: false,
              isCreatedEntity: false,
              key: 'test',
              method: null,
              readOnly: true
            }
            expect(prevProps.location.pathname).toEqual('/foo')
            expect(prevProps.location.search).toEqual('')
            expect(pathname).toEqual('/foo')
            expect(search).toEqual('')
            expect(context).toEqual(expectedContext)

            done()
          }
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
            isModifiedEntity: false,
            isCreatedEntity: true,
            method: 'POST',
            readOnly: false
          }
          expect(context).toEqual(expectedContext)


          // given
          history.push('/beaujolais/AE?changement')
          props = wrapper.find('Test').props()

          // when
          context = props.query.context()

          // then
          expectedContext = {
            isModifiedEntity: true,
            isCreatedEntity: false,
            method: 'PATCH',
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
            isModifiedEntity: false,
            isCreatedEntity: false,
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
          let context = props.query.context({ key:'beaujolais' })

          // then
          let expectedContext = {
            isModifiedEntity: false,
            isCreatedEntity: true,
            key: 'beaujolais',
            method: 'POST',
            readOnly: false
          }
          expect(context).toEqual(expectedContext)


          // given
          history.push('/foo?beaujolaisAE=changement')
          props = wrapper.find('Test').props()

          // when
          context = props.query.context({ key: 'beaujolais', id: 'AE' })

          // then
          expectedContext = {
            isCreatedEntity: false,
            isModifiedEntity: true,
            key: 'beaujolais',
            method: 'PATCH',
            readOnly: false
          }
          expect(context).toEqual(expectedContext)

          // given
          history.push('/foo')
          props = wrapper.find('Test').props()

          // when
          context = props.query.context({ key: 'beaujolais' })

          // then
          expectedContext = {
            isCreatedEntity: false,
            isModifiedEntity: false,
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
