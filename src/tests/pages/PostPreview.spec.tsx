import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/client'
import { getPrismicClient } from '../../services/prismic'
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { useRouter } from 'next/router'

jest.mock('../../services/prismic')
jest.mock('next-auth/client')
jest.mock('next/router')

const post = {
  slug: 'fake-post',
  title: 'Fake Post',
  content: '<p>This is a fake post</p>',
  updatedAt: '09 de agosto de 2022',
}

describe('Post page', () => {
  it('renders correctly', () => {
    const useSessionMocked = jest.mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    render(<Post post={post} />)

    expect(screen.getByText('Fake Post')).toBeInTheDocument()
    expect(screen.getByText('This is a fake post')).toBeInTheDocument()
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
  })

  it('redirects user to full post when user is subscribed', async () => {
    const useSessionMocked = jest.mocked(useSession)
    const useRouterMocked = jest.mocked(useRouter)
    const pushMock = jest.fn()

    useSessionMocked.mockReturnValueOnce([
      { activeSubscription: 'fake-active-subscription' },
      false,
    ])

    useRouterMocked.mockReturnValueOnce({ push: pushMock } as any)

    render(<Post post={post} />)

    expect(pushMock).toHaveBeenCalledWith('/posts/fake-post')
  })

  it('loads initial data', async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'New Fake Post' }],
          content: [{ type: 'paragraph', text: 'This is a new fake post' }],
        },
        last_publication_date: '08-09-2022',
      }),
    } as any)

    const response = await getStaticProps({
      params: { slug: 'fake-post' },
    })

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
