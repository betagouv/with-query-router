# with-query-router

** EN CONSTRUCTION **
Ce code est du code externalisé du https://github.com/betagouv/pass-culture-shared qui concentre un nombre d'utilités React Redux
utilisé par les applications front du pass culture.
Tant que les tests fonctionnels ne sont pas écrits, cette lib ne peut être considérée en production.

## Basic Usage
```javascript

// Let's say you are at location '/foo?counter=1'

import withQueryRouter from 'with-query-router'

class FooPage extends Component {

  onIncrementCounterClick = () => {
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
        <button onClick={this.onIncrementCounterClick}>
          Increment
        </button>
      </div>
    )
  }
}

export default withQueryRouter(FooPage)
```
