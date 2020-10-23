import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './SectionBackgroundWebPart.module.scss';
import * as strings from 'SectionBackgroundWebPartStrings';

import {
  ThemeProvider,
  ThemeChangedEventArgs,
  IReadonlyTheme,
  ISemanticColors
} from '@microsoft/sp-component-base';

export interface ISectionBackgroundWebPartProps {
  description: string;
}

export default class SectionBackgroundWebPart extends BaseClientSideWebPart<ISectionBackgroundWebPartProps> {

  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;

  private setCSSVariables(theming: any) {

    let themingKeys = Object.keys(theming);

    if (themingKeys !== null) {

      themingKeys.forEach(key => {

        this.domElement.style.setProperty(`--${key}`, theming[key])

      });

    }

  }

  protected onInit(): Promise<void> {

    // Consume the new ThemeProvider service
    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);

    // If it exists, get the theme variant
    this._themeVariant = this._themeProvider.tryGetTheme();

    if (this._themeVariant) {

      this.setCSSVariables(this._themeVariant.semanticColors);

    }

    // debugger;

    // Register a handler to be notified if the theme variant changes
    this._themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent);

    return super.onInit();

  }

  /**
   * Update the current theme variant reference and re-render.
   *
   * @param args The new theme
   */
  private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {

    this._themeVariant = args.theme;
    this.setCSSVariables(this._themeVariant.semanticColors);
    // this.render();
  }

  public render(): void {


    const semanticColors: Readonly<ISemanticColors> | undefined = this._themeVariant && this._themeVariant.semanticColors;

    this.domElement.innerHTML = `
      <div ${this._themeProvider} class="${styles.sectionBackground}" data-load-themed-styles="true">
        <div class="${styles.container}">
          <div class="${styles.row}">
            <div class="${styles.column}">
              <span class="${styles.title}">Welcome to SharePoint!</span>
              <p class="${styles.subTitle}">Customize SharePoint experiences using Web Parts.</p>
              <p class="${styles.description}">${escape(this.properties.description)}</p>
              </a>
            </div>
          </div>
        </div>
      </div>`;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
