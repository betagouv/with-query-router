import selectQueryParamsFromQueryString from '../selectQueryParamsFromQueryString'

describe('selectQueryParamsFromQueryString', () => {
  it('', () => {
    // given
    const searchParams = '/test?page=1&mots-cles=test&orderBy=offer.id+desc'

    // when
    const result = selectQueryParamsFromQueryString(searchParams)
    const expected = {
      '/test?page': '1',
      'mots-cles': 'test',
      'orderBy': 'offer.id desc'
    }

    // then
    expect(result).toEqual(expected)

  })
})
