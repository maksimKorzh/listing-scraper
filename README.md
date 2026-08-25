# Listing Scraper

**Listing Scraper** is a visual web scraping Chrome extension designed for people who want to collect data from websites without writing code.

Instead of creating scraping scripts manually, you can select elements directly on a webpage, configure listings and pagination, and let the scraper collect the data for you.

## Demo

See Listing Scraper in action:

[▶️ Watch the demo on YouTube](https://youtu.be/8A1PLHHxJX0)

## Features

- Visual element selection — select elements directly from a webpage
- Listing scraping — scrape multiple listings from a page
- Pagination — automatically move through multiple pages
- Data preview — preview what will be scraped before starting
- Scraper storage — create, remove, and manage scraper configurations
- Data management — download or clear collected data
- Save and load scrapers — save configurations to files and reuse them later
- No coding required

---

## Scraper

### Scraper Status

Shows the current status of the scraper.

Use this to check whether the scraper exists, is running or stopped.

### Create Scraper

Creates a new scraper configuration.

A scraper contains the selectors and settings needed to tell Listing Scraper what data to collect and where to find it.

You can create a scraper before configuring the elements you want to scrape.

### Remove Scraper

Removes the currently configured scraper.

Use this when you want to discard the current scraper configuration and start over.

### Load Scraper

Loads a previously saved scraper configuration from a file.

After loading a scraper, you can review its configuration and use it for scraping.

### Save Scraper

Saves the current scraper configuration to a file.

This allows you to keep a scraper configuration and reuse it later.

Saved configurations can be useful when you want to scrape the same website again or share a scraper configuration.

### Start Scraper

Starts the scraping process using the currently configured scraper.

The scraper follows the configured listing and pagination settings and collects the selected data.

### Stop Scraper

Stops the currently running scraper.

Use this if you want to interrupt scraping before it finishes.

---

## Selectors

Selectors tell Listing Scraper what information to collect from a webpage.

### Set Listings

Defines the links or elements representing individual listings on the page.

For example, on a real-estate website, the listings might be property cards. On an e-commerce website, they might be product links.

The scraper uses the listing configuration to find the pages or items that need to be scraped.

### Set Pagination

Defines how the scraper should navigate between pages.

Configure the pagination element so Listing Scraper can move from one listing page to the next and continue scraping.

This is useful for websites where listings are spread across multiple pages.

### Select Element

Enables visual element selection.

After activating this option, move your mouse over elements on the webpage to highlight them and click an element to select it.

You can use this to define the data fields you want to collect, such as:

- Title
- Price
- Address
- Description
- Any other information available on the page

No CSS or XPath knowledge is required.

### Remove Element

Removes a previously selected element from the scraper configuration.

Use this if you selected a field by mistake or no longer want to collect it.

### Done Selecting

Finishes the element-selection process.

Use this when you have selected all the elements you want to scrape.

### Preview Data

Shows a preview of the data that Listing Scraper is configured to collect.

Use this before starting a full scrape to verify that your selectors are working correctly and that the expected data is being extracted.

---

## Storage

### Download Data

Downloads the data collected by the scraper.

Use this after scraping has finished to save your results locally.

### Clear Data

Deletes the currently collected scraping data.

This does **not** remove the scraper configuration. It only clears the data that has already been collected.

---

## Typical Workflow

A typical scraping session looks like this:

1. **Create Scraper** — create a new scraper configuration.
2. **Set Listings** — select the elements or links representing the listings.
3. **Set Pagination** — configure pagination if the website has multiple pages.
4. **Select Element** — select the data fields you want to collect.
5. **Done Selecting** — finish configuring the fields.
6. **Preview Data** — verify that the expected data is being extracted.
7. **Start Scraper** — start collecting data.
8. **Download Data** — save the collected results.

You can also **Save Scraper** after configuring it so you can load the same configuration again later.

---

## Button Reference

| Section | Button | Purpose |
|---|---|---|
| Scraper | Scraper Status | View scraper status |
| Scraper | Load Scraper | Load a saved scraper |
| Scraper | Save Scraper | Save the current scraper |
| Scraper | Start Scraper | Start scraping |
| Scraper | Stop Scraper | Stop scraping |
| Storage | Create Scraper | Create a new scraper |
| Storage | Remove Scraper | Remove the current scraper |
| Storage | Download Data | Download collected data |
| Storage | Clear Data | Delete collected data |
| Selectors | Set Listings | Configure listing links/items |
| Selectors | Set Pagination | Configure page navigation |
| Selectors | Select Element | Select data elements visually |
| Selectors | Remove Element | Remove a selected element |
| Selectors | Done Selecting | Finish element selection |
| Selectors | Preview Data | Preview scraped data |

---

## Supported Use Cases

Listing Scraper can be used with many types of websites, including:

- Real-estate listings
- E-commerce products
- Used cars
- Job listings
- Other websites containing paginated lists and individual detail pages

The exact results depend on how the target website is structured and whether its content can be accessed by the extension.