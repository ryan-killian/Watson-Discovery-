import React, { FC, useContext } from 'react';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import { CloudPakForDataAuthenticator } from '@disco-widgets/ibm-watson/auth';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, object } from '@storybook/addon-knobs/react';
// due to a bug with addon-info and markdown files https://github.com/storybookjs/storybook/pull/6016/ use marked to convert md to html
import marked from 'marked';
import defaultReadme from './default.md';
import customClientReadme from './custom_client.md';
import {
  DiscoverySearch,
  DiscoverySearchProps,
  SearchContext,
  SearchApi
} from '../DiscoverySearch';
import { DummySearchClient } from '../../../utils/storybookUtils';

const MyComponent: FC<{}> = () => {
  const { searchParameters } = useContext(SearchContext);
  const { performSearch } = useContext(SearchApi);

  return <button onClick={() => performSearch(searchParameters)}>Perform Search</button>;
};

const customSearchClientProps = (): DiscoverySearchProps => ({
  searchClient: new DummySearchClient(),
  projectId: text('Project ID', 'project-id'),
  overrideSearchResults: object('Search results object', {
    matching_results: 1,
    results: [
      {
        document_id: 'doc_id'
      }
    ]
  }),
  overrideQueryParameters: object('Query Parameters', {
    naturalLanguageQuery: 'query string',
    query: 'field:value',
    filter: 'field:value',
    aggregation: 'term(field,count:10)',
    return: 'field_1,field_2',
    offset: 0,
    count: 10
  })
});

storiesOf('DiscoverySearch', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    () => {
      const authenticator = new CloudPakForDataAuthenticator({
        url: text('Base URL', 'http://mycluster.com'),
        username: text('Username', 'foo'),
        password: text('Password', 'bar')
      });
      const defaultProps = (): DiscoverySearchProps => ({
        searchClient: new DiscoveryV2({
          authenticator,
          url: text('Release Path Url', 'http://mycluster.com/my_release'),
          version: text('Version Date', '2019-01-01')
        }),
        projectId: text('Project ID', 'project-id')
      });
      return (
        <DiscoverySearch {...defaultProps()}>
          <MyComponent />
        </DiscoverySearch>
      );
    },
    {
      info: {
        text: marked(defaultReadme)
      }
    }
  )
  .add(
    'custom search client',
    () => {
      const props = customSearchClientProps();
      return (
        <DiscoverySearch {...props}>
          <SearchApi.Consumer>
            {({ performSearch }): React.ReactNode => (
              <SearchContext.Consumer>
                {({ searchParameters }): React.ReactNode => (
                  <button onClick={() => performSearch(searchParameters)}>Perform Search</button>
                )}
              </SearchContext.Consumer>
            )}
          </SearchApi.Consumer>
        </DiscoverySearch>
      );
    },
    {
      info: {
        text: marked(customClientReadme)
      }
    }
  );
