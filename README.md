# with-query-router

A small wrapper of react-router parsing the query params from the location.search

[![CircleCI](https://circleci.com/gh/betagouv/with-query-router/tree/master.svg?style=svg)](https://circleci.com/gh/betagouv/with-query-router/tree/master)
[![npm version](https://img.shields.io/npm/v/with-query-router.svg?style=flat-square)](https://npmjs.org/package/with-query-router)

## Basic Usage
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

export default withQueryRouter(FooPage)
```
