# with-query-router

A small wrapper of react-router parsing the query params from the location.search

[![CircleCI](https://circleci.com/gh/betagouv/with-query-router/tree/master.svg?style=svg)](https://circleci.com/gh/betagouv/with-query-router/tree/master)
[![npm version](https://img.shields.io/npm/v/with-query-router.svg?style=flat-square)](https://npmjs.org/package/with-query-router)

## Basic usage with `parse`
```javascript

// Let's say you are at location '/foo?counter=1'

import withQueryRouter from 'with-query-router'

class FooPage extends Component {

  onIncrementCounter = () => {
    const { query } = this.props
    const { counter } = query.parse()
    // navigate to /foo?counter=2
    query.change({ counter: counter + 1 })
  }

  render () {
    const { query } = this.props
    const { counter } = query.parse()
    return (
      <div>
        My counter is equal to {counter}
        <button onClick={this.onIncrementCounter}>
          Increment
        </button>
      </div>
    )
  }
}

export default withQueryRouter()(FooPage)
```

## Usage for creation and edition with `context`
```javascript

import { Field, Form } from 'react-final-form'
import { requestData } from 'redux-saga-data'
import withQueryRouter from 'with-query-router'

class FooPage extends Component {

  handleActivateForm = () => {
    const { foo, query } = this.props
    const { id } = foo
    // creation with pathname context
    history.push('new')
    // edition with pathname context
    query.change({ edit: null })
    // creation|edition with search context
    query.change({ foo: id
      ? `edit${id}`
      : 'new'
    })
  }

  handleDeactivateForm = formResolver => () => {
    const { history } = this.props
    const { originLocationString } = query.context()
    formResolver()
    history.push(originLocationString)
  }

  onFormSubmit = formValues => {
    const { dispatch, foo, history, query } = this.props
    const { id } = (foo || {})
    const { originLocationString } = query.context()
    const formSubmitPromise = new Promise(resolve => {
      dispatch(requestData({
        apiPath: `/foos/${id || ''}`,
        body: { ...formValues },
        handleSuccess: this.handleDeactivateForm(resolve),
        method
      }))
    })
    return formSubmitPromise
  }

  render () {
    const { query } = this.props
    const { isReadOnly } = query.context()
    return (
      <Form
        initialValues={initialValues}
        onSubmit={this.onFormSubmit}
        render={() => (
          <form onSubmit={handleSubmit}>
            <Field
              name={name}
              render={({ input, meta }) => (
                <input
                  {...input}
                  readOnly={readOnly}
                  type="text"
                />
              )}
            />
            {
              readOnly
              ? (
                <button onClick={this.handleActivateForm} type="button">
                  Create or Edit
                </button>
              )
              : (
                <button type="submit">
                  Save
                </button>
              )
            }
          </form>
        )}
      />
    )
  }
}

export default withQueryRouter()(FooPage)
```

## Usage for url in foreign language with `translate`
```javascript

// Let's say you are at location '/foo/compteur=1'

import withQueryRouter from 'with-query-router'

class FooPage extends Component {

  onIncrementCounter = () => {
    const { query } = this.props
    const { counter } = query.translate()
    // navigate to /foo?compteur=2
    query.change({ counter: counter + 1 })
  }

  render () {
    const { query } = this.props
    const { counter } = query.translate()
    return (
      <div>
        My counter is equal to {counter}
        <button onClick={this.onIncrementCounter}>
          Increment
        </button>
      </div>
    )
  }
}

export default withQueryRouter({
  mapper: { compteur: "counter" }
})(FooPage)
```
