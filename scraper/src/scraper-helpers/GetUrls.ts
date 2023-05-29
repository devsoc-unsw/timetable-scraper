import { load } from 'cheerio';
import { TimetableUrl } from "./interfaces";

import { filterUrls } from "../page-scraper/page-helpers/FilterUrls";
import axios from 'axios';

interface GetUrlsParams {
  url: string;
  regex: RegExp;
}

/**
 * Gets all the urls in the data class on page: page matching regex
 * Each url will have the prefix: base.
 * @param { string } url url of the page to scrape urls from
 * @param { RegExp } regex regex to check each url
 * @returns { Promise<TimetableUrl[]> }: The list of urls on the page, prefixed with @param base
 */
const getUrls = async ({ url, regex }: GetUrlsParams): Promise<TimetableUrl[]> => {
  const response = await axios.get(url);
  const $ = load(response.data);

  const elements = $(".data a[href]")
    .map((_, element) => $(element).attr('href'))
    .get();

  return filterUrls({ elements, regex });
};

export { getUrls, GetUrlsParams };
