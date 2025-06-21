import path from 'path';
import swe from 'swisseph';

swe.swe_set_ephe_path(path.join(process.cwd(), 'lib/ephemeris'));

export default swe;
