
# KnownUser.V3.Salesforce
Before getting started please read the [documentation](https://github.com/queueit/Documentation/tree/main/serverside-connectors) to get acquainted with the flow of Queue-it server-side connectors.

This Salesforce Commerce Cloud (CC) SFRA Cartridge will help you implement Queue-it functionality server-side. The cartridge handles the entire flow for you and will also include the client-side JavaScript client to your website (see how this is done below).

>You can find the latest released version [here](https://github.com/queueit/KnownUser.V3.SalesForceCC/releases/latest).

## Installation

### System objecttype extensions
The Queue-it cartridge relies on multiple attributes defined on the SitePreferences system objecttype, built into Salesforce CC SFRA. The attributes allows you to enable queue-it on a per-site basis and use different customer ids and configurations per site.
- Download `system-objecttype-extensions.xml` from Releases __(TODO ADD LINK)__
- In Business Manager of your Salesforce CC instance, go to `Administration` -> `Site Development` -> `Import & Export`.
- Upload the XML file using the Upload feature under `Import & Export Files`-section.
- Start the import wizard using the `Import` button under `Meta Data`-section
    - Select the previously uploaded file
    - When the XML schema validation finishes, make sure *not* to check the "Delete existing attribute definitions...". When this checkbox is left unchecked, the attributes defined in the XML file will be added, without removing any existing attributes.
    - Verify that the file content summary contains 1 system type extension, 5 attribute definitions and 1 attribute group definition and nothing else and select import.
The Queue-it configuration is now ready to be used. The configuration can be found under `Merchant Tools` *(select site if prompted)* -> `Site Preferences` -> `Custom Preferences`. Please configure all the fields before setting up the Queue-it cartridge. See the description of each field for more information.

If you have multiple sites in Salesforce CC, but with a single account on Queue-it, please use the "Edit Across Sites" functionality on the Queue-it Configurations section of Custom Site Preferences.

### Cartridge __(TODO find better headline)__
- Download the SFRA cartridge from Releases __(TODO ADD LINK)__
- Depending on how you manage your codebase, you can upload the cartridge directly to your Salesforce CC instance or include it in your codebase.
- When the cartridge is uploaded, make sure to add it to the very beginning of your cartridge path, to make sure that Queue-it is able to protect all your site resources.

### Using EnqueueToken
A token could be used for queueing the users. This improves the proction of the site. The token will be included when the user is redirected from your Salesforce CC site to the queue and vice versa. [QueueToken](https://github.com/queueit/QueueToken.V1.JavaScript) package (already included in the cartridge) is used to generate this token. The generated token will be valid for 1 minute.

To use the EnqueueToken follow the below steps:
- The waiting room should be configured to accept this token. This configuration could be made in Queue-it Go platform.
- Enable Enqueue Token under Queue-it configuration for your site in Salesforce Business Manager.
- For any questions please reach out to Queue-it customer service.

### How the cartridge works
__TODO:__ describe that we are using the beforeFooter hook to add script to every page (our js client). That we are using the onRequest hook.

### Analytics ignore
__TODO:__ If you have problem with your analytics you need to ignore the requests please go to trigger and action and an ignore action for '__Analytics' make sure the ignore is not macthed when add-to-cart or edit cart is invoked

### Request body limitations
__TODO:__ they way salesforce is handling this and how we do it.

### Url matching limitations
__TODO:__ comment that connector is seeing internal sales force urls (not external) and how you should design you trigger conditions around this.
