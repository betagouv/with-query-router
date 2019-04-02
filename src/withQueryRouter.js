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
  const creationKey = config.creationKey || 'creation'
  const modificationKey = config.modificationKey || 'modification'

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
        changeToCreation: this.changeToCreation,
        changeToModification: this.changeToModification,
        changeToReadOnly: this.changeToReadOnly,
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
          typeof queryParams[queryParamsKey] !== 'undefined'
        ) {
          nextQueryParams[queryParamsKey] = queryParams[queryParamsKey]
          return
        }
        if (queryParamsUpdater[queryParamsKey] === '') {
          nextQueryParams[queryParamsKey] = null
        }
      })

      const nextLocationSearch = stringify(nextQueryParams)

      const changedPath = `${pathname}?${nextLocationSearch}`

      history[historyMethod](changedPath)
    }

    context = (config={}) => {
      const { key, id } = config
      if (key) {
        return this.contextWithEntityInSearch(config)
      }
      return this.contextWithEntityInPathname()
    }

    contextWithEntityInPathname = () => {
      const { location: { pathname, search } } = this.props
      const queryParams = this.parse()

      const re = new RegExp(`(${creationKey})$`)
      const matchedResults = pathname.match(re)
      const matchedKey = matchedResults && matchedResults[0]
      if (matchedKey) {
        return {
          isModifiedEntity: false,
          isCreatedEntity: true,
          method: 'POST',
          readOnly: false,
        }
      }

      if (Object.keys(queryParams).includes(modificationKey)) {
        const nextSearch = Object.assign({}, queryParams)
        delete nextSearch[modificationKey]
        const nextSearchString = Object.keys(nextSearch).length
          ? `?${stringify(nextSearch)}`
          : ''
        return {
          isModifiedEntity: true,
          isCreatedEntity: false,
          method: 'PATCH',
          readOnly: false,
        }
      }

      return {
        isModifiedEntity: false,
        isCreatedEntity: false,
        method: null,
        readOnly: true,
      }
    }

    contextWithEntityInSearch = (config={}) => {
      const { id, key } = config
      const { location: { pathname } } = this.props
      const queryParams = this.parse()
      let paramKey = key
      let paramValue = queryParams[paramKey]

      if (!id && (paramValue === creationKey || (creationKey.test && creationKey.test(paramValue)))) {

        const nextSearch = Object.assign({}, queryParams)
        delete nextSearch[paramKey]
        const nextSearchString = stringify(nextSearch)

        return {
          isModifiedEntity: false,
          isCreatedEntity: true,
          key,
          method: 'POST',
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

      if (paramValue === modificationKey) {

        const nextSearch = Object.assign({}, queryParams)
        delete nextSearch[paramKey]
        const nextSearchString = stringify(nextSearch)

        return {
          isCreatedEntity: false,
          isModifiedEntity: true,
          key,
          method: 'PATCH',
          readOnly: false,
        }
      }

      return {
        isCreatedEntity: false,
        isModifiedEntity: false,
        key,
        method: null,
        readOnly: true,
      }
    }

    changeToCreation = (queryParamsUpdater, contextConfig={}) => {
      const { key } = contextConfig
      const { history, location } = this.props
      const { pathname, search } = location

      const creationChange = Object.assign({}, queryParamsUpdater)
      if (!key) {
        const creationPathname = `${pathname}/${creationKey}`
        this.change(creationChange, { pathname: creationPathname })
        return
      }

      creationChange[key] = creationKey

      this.change(creationChange)
    }

    changeToModification = (queryParamsUpdater, contextConfig={}) => {
      const { id, key } = contextConfig

      const modificationChange = Object.assign({}, queryParamsUpdater)

      if (!key) {
        modificationChange[modificationKey] = ''
        this.change(modificationChange)
        return
      }

      const queryParams = this.parse()
      Object.keys(queryParams).forEach(queryKey => {
        if (queryKey.startsWith(key)) {
          modificationChange[queryKey] = null
        }
      })
      const nextQueryKey = `${key}${id}`
      modificationChange[nextQueryKey] = modificationKey

      this.change(modificationChange)
    }

    changeToReadOnly = (queryParamsUpdater, contextConfig={}) => {
      const { id, key } = contextConfig
      const { location } = this.props
      const { pathname } = location
      const queryParams = this.parse()

      const readOnlyChange = Object.assign({}, queryParamsUpdater)
      if (!key) {

        if (pathname.endsWith(creationKey)) {

          if (!id) {
            console.warn('You need to specify the created id in the context config')
            return
          }

          const readOnlyPathname = `${pathname.slice(0, -creationKey.length - 1)}/${id}`
          this.change(readOnlyChange, { pathname: readOnlyPathname })
          return
        }

        if (typeof queryParams[modificationKey] !== 'undefined') {
          readOnlyChange[modificationKey] = null
          this.change(readOnlyChange)
          return
        }

        console.warn('tried to changeToReadOnly but did not find a pathname context')
        return
      }

      Object.keys(queryParams).forEach(queryKey => {
        if (queryKey.startsWith(key)) {
          readOnlyChange[queryKey] = null
        }
      })

      this.change(readOnlyChange)
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
