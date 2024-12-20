'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from '@contentful/live-preview/react';

import { CtfRichText } from '@src/components/features/contentful';
import { PageBlogPostFieldsFragment } from '@src/lib/__generated/sdk';

interface ArticleContentProps {
  article: PageBlogPostFieldsFragment;
}
export const ArticleContent = ({ article }: ArticleContentProps) => {
  const { content } = useContentfulLiveUpdates(article);
  const inspectorProps = useContentfulInspectorMode({ entryId: article.sys.id });

  console.log('article content', content);

  return (
    <div {...inspectorProps({ fieldId: 'content' })}>
      <CtfRichText json={content?.json} links={content?.links} />
    </div>
  );
};
