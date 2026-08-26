import createMDX from '@next/mdx';

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      'remark-gfm',
      'remark-frontmatter',
      ['remark-mdx-frontmatter', { name: 'frontmatter' }],
    ],
    rehypePlugins: ['rehype-slug'],
  },
});

export default withMDX({ pageExtensions: ['ts', 'tsx', 'md', 'mdx'] });
