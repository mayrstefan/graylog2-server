// @flow strict
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { withRouter } from 'react-router';

import connect from 'stores/connect';
import { isPermitted } from 'util/PermissionsMixin';
import AppConfig from 'util/AppConfig';

import onSaveView from 'views/logic/views/OnSaveViewAction';
import onSaveAsView from 'views/logic/views/OnSaveAsViewAction';
import { ViewStore } from 'views/stores/ViewStore';
import { SearchMetadataStore } from 'views/stores/SearchMetadataStore';
import SearchMetadata from 'views/logic/search/SearchMetadata';
import * as Permissions from 'views/Permissions';
import View from 'views/logic/views/View';
import type { User } from 'stores/users/UsersStore';

import { DropdownButton, MenuItem, Button, ButtonGroup } from 'components/graylog';
import { Icon } from 'components/common';
import CurrentUserContext from 'contexts/CurrentUserContext';
import DebugOverlay from 'views/components/DebugOverlay';
import ShareViewModal from './views/ShareViewModal';
import ViewPropertiesModal from './views/ViewPropertiesModal';
import IfDashboard from './dashboard/IfDashboard';
import BigDisplayModeConfiguration from './dashboard/BigDisplayModeConfiguration';

const _isAllowedToEdit = (view: View, currentUser: ?User) => isPermitted(currentUser?.permissions, [Permissions.View.Edit(view.id)])
  || (view.type === View.Type.Dashboard && isPermitted(currentUser?.permissions, [`dashboards:edit:${view.id}`]));

const _hasUndeclaredParameters = (searchMetadata: SearchMetadata) => searchMetadata.undeclared.size > 0;

const ViewActionsMenu = ({ view, isNewView, metadata, router }) => {
  const currentUser = useContext(CurrentUserContext);
  const [shareViewOpen, setShareViewOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [saveAsViewOpen, setSaveAsViewOpen] = useState(false);
  const [editViewOpen, setEditViewOpen] = useState(false);
  const hasUndeclaredParameters = _hasUndeclaredParameters(metadata);
  const allowedToEdit = _isAllowedToEdit(view, currentUser);
  const debugOverlay = AppConfig.gl2DevMode() && (
    <>
      <MenuItem divider />
      <MenuItem onSelect={() => setDebugOpen(true)}>
        <Icon name="code" /> Debug
      </MenuItem>
    </>
  );
  return (
    <ButtonGroup>
      <Button onClick={() => onSaveView(view)}
              disabled={isNewView || hasUndeclaredParameters || !allowedToEdit}
              data-testid="dashboard-save-button">
        <Icon name="save" /> Save
      </Button>
      <Button onClick={() => setSaveAsViewOpen(true)}
              disabled={hasUndeclaredParameters}
              data-testid="dashboard-save-as-button">
        <Icon name="copy" /> Save as
      </Button>
      <DropdownButton title={<Icon name="ellipsis-h" />} id="query-tab-actions-dropdown" pullRight noCaret>
        <MenuItem onSelect={() => setEditViewOpen(true)} disabled={isNewView || !allowedToEdit}>
          <Icon name="edit" /> Edit
        </MenuItem>
        <MenuItem onSelect={() => setShareViewOpen(true)} disabled={isNewView || !allowedToEdit}>
          <Icon name="share-alt" /> Share
        </MenuItem>
        {debugOverlay}
        <IfDashboard>
          <MenuItem divider />
          <BigDisplayModeConfiguration view={view} disabled={isNewView} />
        </IfDashboard>
      </DropdownButton>
      {debugOpen && <DebugOverlay show onClose={() => setDebugOpen(false)} />}
      {saveAsViewOpen && (
        <ViewPropertiesModal show
                             view={view.toBuilder().newId().build()}
                             title="Save new dashboard"
                             onClose={() => setSaveAsViewOpen(false)}
                             onSave={(newView) => onSaveAsView(newView, router)} />
      )}
      {editViewOpen && (
        <ViewPropertiesModal show
                             view={view}
                             title="Editing dashboard"
                             onClose={() => setEditViewOpen(false)}
                             onSave={(updatedView) => onSaveView(updatedView, router)} />
      )}
      {shareViewOpen && <ShareViewModal show view={view} currentUser={currentUser} onClose={() => setShareViewOpen(false)} />}
    </ButtonGroup>
  );
};

ViewActionsMenu.propTypes = {
  router: PropTypes.any.isRequired,
  metadata: PropTypes.shape({
    undeclared: ImmutablePropTypes.Set,
  }).isRequired,
  view: PropTypes.instanceOf(View).isRequired,
  isNewView: PropTypes.bool.isRequired,
};

export default connect(
  withRouter(ViewActionsMenu),
  { metadata: SearchMetadataStore, view: ViewStore },
  ({ view: { view, isNew }, ...rest }) => ({ view, isNewView: isNew, ...rest }),
);
