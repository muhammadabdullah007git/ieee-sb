import Hero from '../../components/home/Hero';
import About from '../../components/home/About';
import Stats from '../../components/home/Stats';

import HomePaperSection from '../../components/home/HomePaperSection';
import HomeEventSection from '../../components/home/HomeEventSection';
import HomeBlogSection from '../../components/home/HomeBlogSection';

const Home = () => {
    return (
        <>
            <Hero />
            <Stats />
            <About />
            <HomeEventSection />
            <HomePaperSection />
            <HomeBlogSection />
        </>
    );
};

export default Home;

