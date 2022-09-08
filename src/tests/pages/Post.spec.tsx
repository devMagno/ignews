import { render, screen } from '@testing-library/react'
import { getSession } from 'next-auth/client'
import { getPrismicClient } from '../../services/prismic'
import Post, { getServerSideProps } from '../../pages/posts/[slug]'

jest.mock('../../services/prismic')
jest.mock('next-auth/client')

const post = {
  slug: 'fake-post',
  title: 'Fake Post',
  content: '<p>This is a fake post</p>',
  updatedAt: '09 de agosto de 2022',
}

describe('Post page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />)

    expect(screen.getByText('Fake Post')).toBeInTheDocument()
    expect(screen.getByText('This is a fake post')).toBeInTheDocument()
  })

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = jest.mocked(getSession)

    getSessionMocked.mockResolvedValueOnce(null)

    const response = await getServerSideProps({
      params: { slug: 'fake-post' },
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({ destination: '/' }),
      })
    )
  })

  it('loads initial data', async () => {
    const getSessionMocked = jest.mocked(getSession)
    const getPrismicClientMocked = jest.mocked(getPrismicClient)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    } as any)
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'New Fake Post' }],
          content: [{ type: 'paragraph', text: 'This is a new fake post' }],
        },
        last_publication_date: '08-09-2022',
      }),
    } as any)

    const response = await getServerSideProps({
      params: { slug: 'fake-post' },
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'fake-post',
            title: 'New Fake Post',
            content: '<p>This is a new fake post</p>',
            updatedAt: '09 de agosto de 2022',
          },
        },
      })
    )
  })
})
