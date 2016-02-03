import React from 'react';
import pure from 'recompose/pure';
import Immutable from 'immutable';
import AppBar from 'material-ui/src/app-bar';
import EventListener from 'react-event-listener';
import Paper from 'material-ui/src/paper';
import TextField from 'material-ui/src/text-field';
import ListItem from 'material-ui/src/lists/list-item';
import IconButton from 'material-ui/src/icon-button';
import IconClose from 'material-ui/src/svg-icons/navigation/close';
// let IconShare = require('material-ui/src/svg-icons/social/share');
import IconPeople from 'material-ui/src/svg-icons/social/people';
import FlatButton from 'material-ui/src/flat-button';
// let Toggle = require('material-ui/src/toggle');
// import IconAdd from 'material-ui/src/svg-icons/content/add';
// let Avatar = require('material-ui/src/avatar');
import {connect} from 'react-redux';
import DocumentTitle from 'react-document-title';

import polyglot from 'polyglot';
import accountUtils from 'Main/Account/utils';
import pluginContacts from 'plugin/contacts';
import CanvasHead from 'Main/Canvas/Head';
import CanvasBody from 'Main/Canvas/Body';
import accountAddActions from 'Main/Account/Add/actions';
import MemberAvatar from 'Main/MemberAvatar';

const styles = {
  listItemBody: {
    margin: '-16px 0 0',
  },
  listItemPrimaryText: {
    marginLeft: -16,
  },
};

class AccountAdd extends React.Component {
  static propTypes = {
    account: React.PropTypes.instanceOf(Immutable.Map),
    dispatch: React.PropTypes.func.isRequired,
    routeParams: React.PropTypes.shape({
      id: React.PropTypes.string,
    }).isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.handleBackButton = this.handleBackButton.bind(this);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleTouchTapClose = this.handleTouchTapClose.bind(this);
    this.handleTouchTapSave = this.handleTouchTapSave.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(accountAddActions.fetchAdd(this.props.routeParams.id));

    if (this.props.account && !this.props.account.get('_id')) { // Not a new account
      setTimeout(() => {
        this.refs.name.focus();

        if (process.env.PLATFORM === 'android') {
          cordova.plugins.Keyboard.show();
        }
      }, 0);
    }
  }

  handleBackButton() {
    this.props.dispatch(accountAddActions.navigateBack(this.props.routeParams.id));
  }

  handleTouchTapClose() {
    setTimeout(() => {
      this.props.dispatch(accountAddActions.close(this.props.routeParams.id));
    }, 0);
  }

  handleTouchTapSave() {
    setTimeout(() => {
      this.props.dispatch(accountAddActions.tapSave(this.props.routeParams.id));
    }, 0);
  }

  handleChangeName(event) {
    this.props.dispatch(accountAddActions.changeName(event.target.value));
  }

  onTouchTapAdd() {
    pluginContacts.pickContact().then(this.props.dispatch(accountAddActions.pickContact));
  }

  onToggleShare(event, toggle) {
    this.props.dispatch(accountAddActions.toggleShare(toggle));
  }

  onChangeEmail(memberId, event) {
    this.props.dispatch(accountAddActions.changeMemberEmail(event.target.value, memberId));
  }

  render() {
    const {
      account,
      routeParams,
    } = this.props;

    const appBarLeft = (
      <IconButton onTouchTap={this.handleTouchTapClose}>
        <IconClose />
      </IconButton>
    );

    const appBarRight = (
      <FlatButton label={polyglot.t('save')}
        onTouchTap={this.handleTouchTapSave} data-test="AccountAddSave"
      />
    );

    const self = this;

    // let avatarAdd = <Avatar icon={<IconAdd />} color="#000" backgroundColor="#fff" />;

    let title;

    if (routeParams.id) {
      title = polyglot.t('account_edit');
    } else {
      title = polyglot.t('account_add_new');
    }

    return (
      <div>
        {(process.env.PLATFORM === 'browser' || process.env.PLATFORM === 'server') &&
          <DocumentTitle title={title} />
        }
        <EventListener elementName="document" onBackButton={this.handleBackButton} />
        <CanvasHead>
          <AppBar title={title} data-test="AppBar"
            iconElementLeft={appBarLeft}
            iconElementRight={appBarRight}
          />
        </CanvasHead>
        <CanvasBody>
          <Paper rounded={false}>
            <ListItem disabled={true}>
              <TextField hintText={polyglot.t('account_name_hint')}
                defaultValue={accountUtils.getNameAccount(account)} fullWidth={true}
                onChange={this.handleChangeName} style={styles.listItemBody} floatingLabelText={polyglot.t('name')}
                data-test="AccountAddName" ref="name"
              />
            </ListItem>
            {/*<ListItem disabled={true} leftIcon={<IconShare />}>
              <div style={Object.assign({}, styles.listItemBody, styles.listItemPrimaryText)}>
                <ListItem>polyglot.t('account_add_shared')} rightToggle={
                    <Toggle defaultToggled={account.share} onToggle={this.onToggleShare} />
                  } />
              </div>
            }/>*/}
            <ListItem disabled={true} leftIcon={<IconPeople />}>
              <div>
                {polyglot.t('members')}
                {account && account.get('members').map((member) => {
                  return (
                    <ListItem key={member.get('id')} disabled={true}
                      leftAvatar={<MemberAvatar member={member} />}
                    >
                      <div>
                        {accountUtils.getNameMember(member)}
                        {account.get('share') &&
                          <TextField hintText={polyglot.t('email')}
                            defaultValue={member.get('email')} fullWidth={true}
                            onChange={self.onChangeEmail.bind(self, member.get('id'))} style={styles.listItemBody}
                            data-test="AccountAddName"
                          />
                        }
                      </div>
                    </ListItem>
                  );
                })}
                {/*<ListItem leftAvatar={avatarAdd} onTouchTap={this.onTouchTapAdd}>
                  {polyglot.t('add_a_new_person')}
                }/>*/}
              </div>
            </ListItem>
          </Paper>
        </CanvasBody>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    account: state.get('accountCurrent'),
  };
}

export default connect(mapStateToProps)(pure(AccountAdd));
