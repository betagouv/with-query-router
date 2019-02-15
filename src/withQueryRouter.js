import uniq from 'lodash.uniq'
import PropTypes from 'prop-types'
import { stringify } from 'query-string'
import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'

import { selectQueryParamsFromQueryString } from './selectQueryParamsFromQueryString'

export const withQueryRouter = WrappedComponent => {
  class _withQueryRouter extends PureComponent {
    constructor(props) {
      super(props)
      this.query = {
        add: this.add,
        change: this.change,
        clear: this.clear,
        context: this.context,
        parse: this.parse,
        remove: this.remove,
      }
    }

    add = (key, value) => {
      const queryParams = this.parse()

      let nextValue = value
      const previousValue = queryParams[key]
      if (previousValue && previousValue.length) {
        const args = previousValue.split(',').concat([value])
        args.sort()
        nextValue = args.join(',')
      } else if (typeof previousValue === 'undefined') {
        console.warn(
          `Weird did you forget to mention this ${key} query param in your withQueryRouter hoc?`
        )
      }

      this.change({ [key]: nextValue })
    }


    clear = () => {
      const { history, location } = this.props
      history.push(location.pathname)
    }

    change = (queryParamsUpdater, changeConfig = {}) => {
      const { history, location } = this.props
      const queryParams = this.parse()

      const historyMethod = changeConfig.historyMethod || 'push'
      const pathname = changeConfig.pathname || location.pathname
      const queryParamsKeys = uniq(
        Object.keys(queryParams).concat(Object.keys(queryParamsUpdater))
      )

      const nextQueryParams = {}
      queryParamsKeys.forEach(queryParamsKey => {
        if (queryParamsUpdater[queryParamsKey]) {
          nextQueryParams[queryParamsKey] = queryParamsUpdater[queryParamsKey]
          return
        }
        if (
          queryParamsUpdater[queryParamsKey] !== null &&
          queryParams[queryParamsKey]
        ) {
          nextQueryParams[queryParamsKey] = queryParams[queryParamsKey]
        }
      })

      const nextLocationSearch = stringify(nextQueryParams)

      const newPath = `${pathname}?${nextLocationSearch}`

      history[historyMethod](newPath)
    }

    context = (key, id) => {
      if (key) {
        return this.contextWithEntityInSearch(key, id)
      }
      return this.contextWithEntityInPathname()
    }

    contextWithEntityInPathname = () => {
      const { location: { pathname, search } } = this.props
      const queryParams = this.parse()

      if (pathname.endsWith('new')) {
        return {
          isEditEntity: false,
          isNewEntity: true,
          method: 'POST',
          originLocationString: `${pathname.slice(0, -3)}${search}`,
          readOnly: false,
        }
      }

      if (Object.keys(queryParams).includes('edit')) {
        const nextSearch = Object.assign({}, queryParams)
        delete nextSearch.edit
        const nextSearchString = stringify(nextSearch)
        return {
          isEditEntity: true,
          isNewEntity: false,
          method: 'PATCH',
          originLocationString: `${pathname}${nextSearchString}`,
          readOnly: false,
        }
      }

      return {
        isEditEntity: false,
        isNewEntity: false,
        method: null,
        readOnly: true,
      }
    }

    contextWithEntityInSearch = (key, id) => {
      const queryParams = this.parse()
      const paramsValue = queryParams[key]

      if (paramsValue === 'new') {
        return {
          isEditEntity: false,
          isNewEntity: true,
          key,
          method: 'POST',
          // originLocationString: `${pathname.slice(0, -3)}${searchString}`,
          readOnly: false,
        }
      }

      if (paramsValue === `edit${id || ''}`) {
        // const nextSearch = Object.assign({}, search)
        // delete nextSearch.edit
        // const nextSearchString = stringify(nextSearch)
        return {
          isEditEntity: true,
          isNewEntity: false,
          key,
          method: 'PATCH',
          // originLocationString: `${pathname}${nextSearchString}`,
          readOnly: false,
        }
      }

      return {
        isEditEntity: false,
        isNewEntity: false,
        key,
        method: null,
        readOnly: true,
      }
    }


    parse = () => {
      const { location } = this.props
      return selectQueryParamsFromQueryString(location.search)
    }

    remove = (key, value) => {
      const queryParams = this.parse()

      const previousValue = queryParams[key]
      if (previousValue && previousValue.length) {
        let nextValue = previousValue
          .replace(`,${value}`, '')
          .replace(value, '')
        if (nextValue[0] === ',') {
          nextValue = nextValue.slice(1)
        }
        this.change({ [key]: nextValue })
      } else if (typeof previousValue === 'undefined') {
        console.warn(
          `Weird did you forget to mention this ${key} query param in your withQueryRouter hoc?`
        )
      }
    }

    render() {
      return <WrappedComponent {...this.props} query={this.query} />
    }
  }

  _withQueryRouter.propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }

  _withQueryRouter.WrappedComponent = WrappedComponent

  return withRouter(_withQueryRouter)
}

export default withQueryRouter
