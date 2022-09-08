import { render, screen } from '@testing-library/react'
import Posts, { getStaticProps } from '../../pages/posts'
import { getPrismicClient } from '../../services/prismic'

jest.mock('../../services/prismic')

const posts = [
  {
    slug: 'fake-post',
    title: 'Fake Post',
    excerpt: 'This is a fake post',
    updatedAt: '08-09-2022',
  },
]

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Posts posts={posts} />)

    expect(screen.getByText('Fake Post')).toBeInTheDocument()
  })

  it('loads initial data', async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'new-fake-post',
            data: {
              title: [{ type: 'heading', text: 'New Fake Post' }],
              content: [{ type: 'paragraph', text: 'This is a new fake post' }],
            },
            last_publication_date: '08-09-2022',
          },
        ],
      }),
    } as any)

    const response = await getStaticProps({})

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: 'new-fake-post',
              title: 'New Fake Post',
              excerpt: 'This is a new fake post',
              updatedAt: '09 de agosto de 2022',
            },
          ],
        },
      })
    )
  })
})
