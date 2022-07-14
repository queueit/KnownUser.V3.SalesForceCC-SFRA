# KnownUser.V3.Salesforce
Before getting started please read the [documentation](https://github.com/queueit/Documentation/tree/main/serverside-connectors) to get acquainted with the flow of Queue-it server-side connectors.

This Salesforce Commerce Cloud (CC) SFRA Cartridge will help you implement Queue-it functionality server-side. The cartridge handles the entire flow for you and will also include the client-side JavaScript client to your website (see how this is done below).

>You can find the latest released version [here](https://github.com/queueit/KnownUser.V3.SalesForceCC/releases/latest).

## Installation

### Compatibility Mode
**Important:** This cartridge *should* have a [Compatibility Mode](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_compatibility_mode_considerations.html?cp=0_7_6_4) of 19.10, but has only been tested against 21.2. Please we cautious when installing this cartridge if you require 19.10 (or lower).

### Queue-IT Cartridge
- Download the SFRA cartridge from latest [Release](https://github.com/queueit/KnownUser.V3.SalesForceCC/releases/latest)
- Depending on how you manage your codebase, you can upload the cartridge directly to your Salesforce CC instance or include it in your codebase.
- When the cartridge is uploaded, make sure to add it to the very beginning of your cartridge path, to make sure that Queue-it is able to protect all your site resources.
- If you have problem with your analytics you need to ignore the requests. Use GO Queue-it Platform to create trigger and ignore action for '__Analytics'. Make sure the ignore is not macthed when add-to-cart or edit cart is invoked

**Note: Connector is dealing with internal Salesforce URLs (not external). So trigger conditions in Go Queue-IT plateform should be defined according to Salesforce internal URLs.**

### QueueIT attributes
The Queue-it cartridge relies on multiple attributes defined on the SitePreferences system object type, built in Salesforce CC SFRA. The attributes allows you to enable queue-it on a per-site basis and use different customer ids and configurations per site. You can either mannually define the following attributes in SitePreferences or download `system-objecttype-extensions.xml` file from [here](https://github.com/queueit/KnownUser.V3.SalesForceCC-SFRA/blob/main/cartridges/int_queueit_sfra/metadata/meta/system-objecttype-extensions.xml) and upload in business manager.

| Attribute                           | Required  | DataType  | Value                                                                                                                     |
| ---                                 | :---:     | :---:     | :---:                                                                                                                     |
| `queueit-customerId`                | Yes       | string    | Find your Customer ID in the GO Queue-it Platform.                                                                        |
| `queueit-enabled`                   | Yes       | bolean    | Default: false                                                                                                            |
| `queueit-enableEnqueueToken`        | Yes       | bolean    | Default: false. Please see [documentation](https://github.com/queueit/KnownUser.V3.SalesForceCC-SFRA#using-enqueuetoken). |
| `queueit-disableEnqueueTokenKey`    | Yes       | bolean    | Default: false                                                                                                            |
| `queueit-enableLogging`             | Yes       | bolean    | Default: false                                                                                                            |
| `queueit-integrationsConfigString`  | Yes       | bolean    | Find your integration cofiguration in the GO Queue-it Platform.                                                           |
| `queueit-secretKey`                 | Yes       | string    | Find your Secret key in the GO Queue-it Platform.                                                                         |

### Setup Queue-It attributes

#### Manually define attributes
1. In Business Manager of your Salesforce CC instance, go to `Administration` -> `Site Development` -> `System Object Types` -> `Site Preferences` -> `Attribute Definitions` tab.
2. Define the above mentioned attributes.
3. Then go to `Attribute Groups` on same page. Create 'queueit' group and include all Queue-IT attributes.

#### Upload attributes
1. Download [`system-objecttype-extensions.xml`](https://github.com/queueit/KnownUser.V3.SalesForceCC-SFRA/blob/main/cartridges/int_queueit_sfra/metadata/meta/system-objecttype-extensions.xml) from latest release.
2. In Business Manager of your Salesforce CC instance, go to `Administration` -> `Site Development` -> `Import & Export`.
3. Upload the XML file using the Upload feature under `Import & Export Files`-section.
4. Go back to `Import & Export` page and start the import wizard using the `Import` button under `Meta Data`-section
    1. Select the previously uploaded file
    2. When the XML schema validation finishes, make sure *not* to check the "Delete existing attribute definitions...". When this checkbox is left unchecked, the attributes defined in the XML file will be added, without removing any existing attributes.
    3. Verify that the file content summary contains 1 system type extension, 7 attribute definitions and 1 attribute group definition and nothing else and select import.

#### Set attributes values
The Queue-it configuration is now ready to be used. The configuration can be found under `Merchant Tools` *(select site if prompted)* -> `Site Preferences` -> `Custom Preferences`. Please configure all the attributes before setting up the Queue-it cartridge.

If you have multiple sites in Salesforce CC, but with a single account on Queue-it, please use the "Edit Across Sites" functionality on the Queue-it Configurations section of Custom Site Preferences.

### Setup custom log category
To view any logs from this cartridge, you will need to setup a custom log category. The category name must be `QueueIt`.
1. In Business Manager of your Salesforce CC instance, go to `Administration` -> `Operations` -> `Custom Log Settings`.
2. Under Custom Log Filters, add a new category with the name `QueueIt` and select the desired Log Level (e.g. WARN to include WARN, ERROR and FATAL log levels).

## Advanced features

### Using EnqueueToken
A token could be used for queueing the users. This improves the proction of the site. The token will be included when the user is redirected from your Salesforce CC site to the queue and vice versa. [QueueToken](https://github.com/queueit/QueueToken.V1.JavaScript) package (already included in the cartridge) is used to generate this token. The generated token will be valid for 1 minute.

To use the EnqueueToken follow the below steps:
- The waiting room should be configured to accept this token. This configuration could be made in Queue-it Go platform.
- Enable Enqueue Token under Queue-it configuration for your site in Salesforce Business Manager.
- For any questions please reach out to Queue-it customer service.
- If you are using invite-only waiting rooms simultaneously and want to generate default enqueuetoken on the connector you need set queueit-disableEnqueueTokenKey to true and in your waiting room set "Require user identification key" to Disabled.

## Releases and versions
This SDK requires two other Queue-it packages (which are already included). Below is a table with the version of each of these packages, which is compatible with the releases of this package.
| Salesforce SDK version | KnownUser.V3.Javascript | QueueToken.V1.JavaScript |
| ---       | ---                                                                               | ---                                                                               |
| 2.0.0     | [3.7.5](https://github.com/queueit/KnownUser.V3.Javascript/releases/tag/3.7.5)    | [1.0.3](https://github.com/queueit/QueueToken.V1.JavaScript/releases/tag/1.0.3)   |
| 2.1.0     | [3.7.10](https://github.com/queueit/KnownUser.V3.Javascript/releases/tag/3.7.10)  | [1.0.3](https://github.com/queueit/QueueToken.V1.JavaScript/releases/tag/1.0.3)   |
