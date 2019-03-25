import invert from 'lodash.invert'
import uniq from 'lodash.uniq'
import PropTypes from 'prop-types'
import { stringify } from 'query-string'
import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'

import { selectQueryParamsFromQueryString } from './selectQueryParamsFromQueryString'
import { getObjectWithMappedKeys } from './getObjectWithMappedKeys'

export const withQueryRouter = (config={}) => WrappedComponent => {
  const { mapper, translater } = config
  const editKey = config.editKey || 'edit'
  const newKey = config.newKey || 'new'

  let invertedMapper
  if (mapper) {
    invertedMapper = invert(mapper)
  }

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
        translate: this.translate
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
        /* eslint-disable no-console */
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

    change = (notTranslatedQueryParamsUpdater, changeConfig = {}) => {
      const { history, location } = this.props
      const queryParams = this.parse()

      const historyMethod = changeConfig.historyMethod || 'push'
      const pathname = changeConfig.pathname || location.pathname

      let queryParamsUpdater = notTranslatedQueryParamsUpdater
      if (translater) {
        queryParamsUpdater = translater(queryParamsUpdater)
      } else if (mapper) {
        queryParamsUpdater = getObjectWithMappedKeys(
          queryParamsUpdater, invertedMapper)
      }

      const queryParamsUpdaterKeys = Object.keys(queryParamsUpdater)
      const concatenatedQueryParamKeys = Object.keys(queryParams)
                                               .concat(queryParamsUpdaterKeys)
      const queryParamsKeys = uniq(concatenatedQueryParamKeys)

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

      const re = new RegExp(`(${newKey})$`)
      const matchedResults = pathname.match(re)
      const matchedKey = matchedResults && matchedResults[0]
      if (matchedKey) {
        const originLocationString = `${pathname.slice(0, -matchedKey.length)}${search}`
        return {
          isEditEntity: false,
          isNewEntity: true,
          method: 'POST',
          originLocationString,
          readOnly: false,
        }
      }

      if (Object.keys(queryParams).includes(editKey)) {
        const nextSearch = Object.assign({}, queryParams)
        delete nextSearch[editKey]
        const nextSearchString = Object.keys(nextSearch).length
          ? `?${stringify(nextSearch)}`
          : ''
        const originLocationString = `${pathname}${nextSearchString}`
        return {
          isEditEntity: true,
          isNewEntity: false,
          method: 'PATCH',
          originLocationString,
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
      const { location: { pathname } } = this.props
      const queryParams = this.parse()
      let paramKey = key
      let paramValue = queryParams[paramKey]

      if (paramValue === newKey || (newKey.test && newKey.test(paramValue))) {

        const nextSearch = Object.assign({}, queryParams)
        delete nextSearch[paramKey]
        const nextSearchString = stringify(nextSearch)
        const originLocationString = Object.keys(nextSearch).length
          ? `${pathname}?${nextSearchString}`
          : pathname

        return {
          isEditEntity: false,
          isNewEntity: true,
          key,
          method: 'POST',
          originLocationString,
          readOnly: false,
        }
      }

      if (!paramValue) {
        paramKey = `${key}${id}`
        paramValue = queryParams[paramKey]
        if (!paramValue) {
          paramKey = Object.keys(queryParams)
                           .find(queryKey => queryKey.startsWith(key))
          paramValue = queryParams[paramKey]
        }
      }

      if (paramValue === editKey) {

        const nextSearch = Object.assign({}, queryParams)
        delete nextSearch[paramKey]
        const nextSearchString = stringify(nextSearch)
        const originLocationString = Object.keys(nextSearch).length
          ? `${pathname}?${nextSearchString}`
          : pathname

        return {
          isEditEntity: true,
          isNewEntity: false,
          key,
          method: 'PATCH',
          originLocationString,
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

    translate = () => {
      const queryParams = this.parse()
      if (translater) {
        return translater(queryParams)
      }
      if (mapper) {
        return getObjectWithMappedKeys(queryParams, mapper)
      }
      return queryParams
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
