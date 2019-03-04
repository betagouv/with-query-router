# with-query-router

A small wrapper of react-router parsing the query params from the location.search

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
