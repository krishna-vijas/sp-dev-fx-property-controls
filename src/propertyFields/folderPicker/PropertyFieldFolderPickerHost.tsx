import * as React from 'react';
import styles from './FolderPicker.module.scss';
import { IPropertyFieldFolderPickerHostProps } from './IPropertyFieldFolderPickerHost';
import { IFolder } from '../../services/IFolderExplorerService';
import { IconButton, PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { getId } from 'office-ui-fabric-react/lib/Utilities';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { FolderExplorer } from './controls/FolderExplorer';
import { IPropertyFieldFolderPickerState } from './IPropertyFieldFolderPickerState';
import * as telemetry from '../../common/telemetry';
import { getPropertyValue, setPropertyValue } from '../../helpers/GeneralHelper';

export default class PropertyFieldFolderPickerHost extends React.Component<IPropertyFieldFolderPickerHostProps, IPropertyFieldFolderPickerState> {

  private _folderLinkId = getId('folderLink');
  private _selectedFolder: IFolder;

  constructor(props: IPropertyFieldFolderPickerHostProps) {
    super(props);

    telemetry.track('PropertyFieldFolderPicker', {
      disabled: props.disabled
    });

    this.state = {
      showPanel: false,
      selectedFolder: getPropertyValue<IFolder>(props.properties, props.targetProperty) || this.props.defaultFolder
    };
  }

  public componentWillReceiveProps(nextProps: IPropertyFieldFolderPickerHostProps) {
    const currentValue = getPropertyValue(this.props.properties, this.props.targetProperty);
    const nextValue = getPropertyValue(nextProps.properties, nextProps.targetProperty);

    if(currentValue !== nextValue){
      this.setState({
        selectedFolder: nextValue
      });
    }
  }

  public render(): React.ReactElement<IPropertyFieldFolderPickerHostProps> {
    return (
      <div>
        {this.props.label &&
          <Label className={this.props.required ? styles.required : ''} htmlFor={this._folderLinkId}>{this.props.label}</Label>
        }
        <div className={styles.folderPicker}>
          <div className={styles.selection}>
            {!this.state.selectedFolder &&
              <span className={styles.selectFolderLabel}>Select a folder</span>
            }
            {this.state.selectedFolder &&
              <div className={styles.selectFolder}>
                <Link className={styles.selectedLink} target='_blank' data-interception="off" id={this._folderLinkId} href={this.state.selectedFolder.ServerRelativeUrl}>
                  <span title={this.state.selectedFolder.Name}>{this.state.selectedFolder.Name}</span>
                </Link>
                <IconButton
                  iconProps={{ iconName: 'Cancel' }}
                  title="Delete selection"
                  ariaLabel="Delete selection"
                  onClick={this._resetSelection}
                  disabled={this.props.disabled}
                />
              </div>
            }
          </div>
          <div className={styles.selectButton}>
            <IconButton
              iconProps={{ iconName: 'FolderList' }}
              title="Select folder"
              ariaLabel="Select folder"
              disabled={this.props.disabled}
              onClick={this._showPanel}
            />
          </div>
        </div>

        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.medium}
          onDismiss={this._hidePanel}
          headerText="Select folder"
          closeButtonAriaLabel="Close"
          onRenderFooterContent={this._onRenderFooterContent}
        >
          <div>
            <FolderExplorer
              context={this.props.context}
              rootFolder={this.props.rootFolder}
              defaultFolder={this.state.selectedFolder}
              onSelect={this._onFolderSelect}
              canCreateFolders={this.props.canCreateFolders}
            />
          </div>
        </Panel>

      </div>
    );
  }

  private _showPanel = () => {
    this.setState({ showPanel: true });
  }

  private _hidePanel = () => {
    this.setState({ showPanel: false });
  }

  private _onRenderFooterContent = () => {
    return (
      <div className={styles.actions}>
        <PrimaryButton iconProps={{ iconName: 'Save' }} onClick={this._onFolderSave}>
          Save
        </PrimaryButton>
        <DefaultButton iconProps={{ iconName: 'Cancel' }} onClick={this._hidePanel}>
          Cancel
        </DefaultButton>
      </div>
    );
  }

  private _onFolderSelect = (folder: IFolder): void => {
    this._selectedFolder = folder;
  }

  private _onFolderSave = (): void => {

    this.props.onSelect(this._selectedFolder);

    setPropertyValue(this.props.properties, this.props.targetProperty, this._selectedFolder);
    this.props.onPropertyChange(this.props.targetProperty, this.props.selectedFolder, this._selectedFolder);

    if (typeof this.props.onChange !== 'undefined' && this.props.onChange !== null) {
      this.props.onChange(this.props.targetProperty, this._selectedFolder);
    }

    this.setState({
      selectedFolder: this._selectedFolder,
      showPanel: false,
    });

  }

  private _resetSelection = (): void => {
    this._selectedFolder = null;

    this.setState({
      selectedFolder: this._selectedFolder,
    });

    this.props.onSelect(this._selectedFolder);
    setPropertyValue(this.props.properties, this.props.targetProperty, this._selectedFolder);
    this.props.onPropertyChange(this.props.targetProperty, this.props.selectedFolder, this._selectedFolder);

    if (typeof this.props.onChange !== 'undefined' && this.props.onChange !== null) {
      this.props.onChange(this.props.targetProperty, this._selectedFolder);
    }
  }
}
