# Timetable Scraper

This module scrapes UNSW courses and their class information in a specified study period, from [timetable.unsw.edu.au](https://timetable.unsw.edu.au/). The server stores this in a JSON file in memory. There are a number of public endpoints for use by Notangles, Freerooms, and other projects.

## Installation

In two separate terminals, `cd` into `/api` and `/scraper` and run `yarn` in both folders. This will install the required packages for the server and scraper respectively.

## Running the scraper

To run the scraper locally, first start the API, then run the scraper script.

### API

in the terminal for `/api`, run `npm run build` to transpile the Typescript code to Javascript. Once this is done, run `npm run start:local` to start the server.

### Scraper

First, in the terminal for `/scraper` run `npm run build` to transpile the Typescript code to Javascript. Once this is done, run `npm run scrape` to start the scraper. Ensure that the server is running before the scraper is run.

## Tech Stack:

This web-scraper uses:

- [Puppeteer](https://github.com/puppeteer/puppeteer)
- [TypeScript](https://www.typescriptlang.org/)
- [Lodash](https://lodash.com/)

## How it works

### The Source Data

UNSW stores timetable-related information about all courses offered on [timetable.unsw.edu.au](https://timetable.unsw.edu.au/).

- The site has at most one page per course offered per year.

  - Each page is further divided into subsections detailing all classes per term.
  - There is also a subsection that provides a list of timings and location for each of the classes.

- The site also has a page which contains a links to pages for each subject area (COMP, ARTS, ECON etc). Which in turn contain the links to each page that provide information about one or two courses.

### The Scraper

The scraper has three parts:

1. Scrape data from a page.

   - Based on the strucure of the page, the scraper parses each subsection and converts the data on the page to an array of JSON objects.

2. Visit each page of the website so that every course can be scraped.

   - Puppeteer - the chromium headless browser, is used to automate this process. First it visits each page on a subject area, then obtains link urls to each of the course pages and then visits each course page.
     It opens each page on the website in a separate tab. To improve speed, it opens 50 tabs at once.

   - Once it finishes scraping the site, it then groups the courses into 6 terms: `Summer, T1, T2, T3, S1 and S2` based on the dates that the course classes run.

   - The scraper also checks the data for any errors. If it finds data that is not in the expected format, it makes a copy of the data that it thinks is erroneous and adds it to a list of warnings. This list of warnings is then returned to the caller. Each warning is tagged with a warning tag and a simple warning message. For example:

   ```json
   {
     "courseCode": "ATSI0002",
     "courseName": "Enabling Skills 2",
     "tag": "Unknown Location",
     "classID": 10723,
     "term": "T2",
     "error": {
       "key": "location",
       "value": "( )"
     }
   }
   ```
3. Make a POST request to the server with the updated data, which is then written to a JSON file.

### Example Extracted Data

From COMP1511 offered in term 1 2019

```json
{
    "courseCode": "COMP1511",
    "name": "Programming Fundamentals",
    "school": "School of Computer Sci & Eng",
    "campus": "Sydney",
    "career": "Undergraduate",
    "termsOffered": [
        "T1",
        "T2",
        "T3"
    ],
    "censusDates": [
        "17-MAR-2019",
        "30-JUN-2019",
        "13-OCT-2019"
    ],
    "classes": [
    {
        "classID": 9596,
        "section": "1UGA",
        "term": "T1",
        "activity": "Lecture",
        "status": "Open",
        "courseEnrolment": {
            "enrolments": 339,
            "capacity": 497
        },
        "termDates": {
            "start": "18/02/2019",
            "end": "19/05/2019"
        },
        "mode": "In Person",
        "times": [
            {
                "day": "Tue",
                "time": {
                    "start": "09:00",
                    "end": "11:00"
                },
                "weeks": "1-10",
                "location": "Central Lecture Block 7 (K-E19-104)"
            },
            {
                "day": "Tue",
                "time": {
                    "start": "11:00",
                    "end": "13:00"
                },
                "weeks": "11",
                "location": "Central Lecture Block 7 (K-E19-104)"
            },
            {
                "day": "Thu",
                "time": {
                    "start": "11:00",
                    "end": "13:00"
                },
                "weeks": "1-9",
                "location": "Central Lecture Block 7 (K-E19-104)"
            }
        ],
        "notes": "This class is initially reserved for new students"
    }
}
```

## What next?

Here's a list of possible improvements:

1. Refactor: Long and Complicated functions exist in the code. These are mainly due to puppeteer's context, which does not have access to the data outside the browser's context. Similarly, the part of the scraper that runs in the node, does not have access to variables in the browser's context. The code must be refactored to accomodate this, so that it is more understandable.

2. Performance Boost: Since the pages of the browser work in batches, the tabs that were opened first have to wait for every tab in the batch to finish scraping before moving onto the next url. Find a way to minimize/remove this wait.

3. Flexibility: The data structure might be changed. With that in mind, perhaps the user could supply a page/data structure and validation rules to make the process more robust.
