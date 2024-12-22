import "../styles/landing.css";
import 'bootstrap/dist/css/bootstrap.css';
import { Carousel, Accordion, Button, Container, Row, Col, Image, Card } from 'react-bootstrap';
import globe from "../assets/globe.gif";
import client1 from "../assets/client1.jpeg";
import client2 from "../assets/client2.jpg";
import client3 from "../assets/client3.jpg";
import mexico_banner from "../assets/mexico-banner.png";
import france_banner from "../assets/france-banner.jpeg";
import japan_banner from "../assets/japan-banner.jpeg";

function LandingPage() {
    return (
        <div>
            {/* Hero Section */}
            <section id="header">
                <Container fluid="lg">
                    <Row className="g-4 justify-content-start align-items-center">
                        <Col xs={12} md={5} className="text-right">
                            <h1 className="display-3 header-text">
                                Share your travel experiences with Rover!
                            </h1>
                            <Button href="/auth" size="lg" className="rounded-pill purple-btn">
                                Join Now!
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section id="features">
                <Container fluid="lg" className="mb-4">
                    <div className="text-center">
                        <h2 className="section-title">The Rover Experience</h2>
                        <p className="lead section-subtitle">Revolutionizing <span className="bold">Travel</span> one step at a time</p>
                    </div>
                    <Row className="d-flex justify-content-center">
                        <Col xs={12} lg={6}>
                            <div className="feature-title">
                                <h3 className="bold">Explore. Plan. Connect.</h3>
                                <p>Join Rover today and start mapping your adventures. Connect with travelers, share your stories, and show the world where you've been!</p>
                            </div>

                            {/* Features */}
                            <div className="feats">
                                <div className="feature mb-3">
                                    <div className="rounded-4 rounded-feature d-flex justify-content-center align-items-center">
                                        <i className="bi bi-globe-americas"></i>
                                    </div>
                                    <div className="feature-text">
                                        <h4>Map Your Adventures!</h4>
                                        <p>Show your adventures to your friends!</p>
                                    </div>
                                </div>
                                <div className="feature mb-3">
                                    <div className="rounded-4 rounded-feature d-flex justify-content-center align-items-center">
                                        <i className="bi bi-calendar2-week"></i>
                                    </div>
                                    <div className="feature-text">
                                        <h4>Plan Your Dream Trip!</h4>
                                        <p>Plan your next adventure with our itinerary creator!</p>
                                    </div>
                                </div>
                                <div className="feature mb-3">
                                    <div className="rounded-4 rounded-feature d-flex justify-content-center align-items-center">
                                        <i className="bi bi-chat-dots"></i>
                                    </div>
                                    <div className="feature-text">
                                        <h4>Interact with fellow travelers!</h4>
                                        <p>Rover is a safe space for travelers from all backgrounds!</p>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} lg={6} className="featured-globe">
                            <Image src={globe} fluid />
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Reviews Section */}
            <section id="reviews">
                <Container>
                    <div className="text-center">
                        <h2 className="section-title" style={{ color: "#FF960B" }}>Reviews</h2>
                        <p className="lead section-subtitle">Hear what some of our clients have to say about our services!</p>
                    </div>
                    {/* Carousel */}
                    <Carousel>
                        <Carousel.Item>
                            <div className="testimonial">
                                <Image src={client1} roundedCircle className="testimonial-pic" alt="Client 1" />
                                <div className="testimonial-text">
                                    <p>"After visiting every country, I can confidently say that Rover is an incredible platform for both new and seasoned travelers."</p>
                                    <em>-Drew Binsky</em>
                                </div>
                            </div>
                        </Carousel.Item>
                        <Carousel.Item>
                            <div className="testimonial">
                                <Image src={client2} roundedCircle className="testimonial-pic" alt="Client 2" />
                                <div className="testimonial-text">
                                    <p>"As someone who's just getting started with traveling, Rover has been a game-changer for me! The itinerary creation feature made it so easy for me to plan my first trip to Europe."</p>
                                    <em>-Cecilia Laterano</em>
                                </div>
                            </div>
                        </Carousel.Item>
                        <Carousel.Item>
                            <div className="testimonial">
                                <Image src={client3} roundedCircle className="testimonial-pic" alt="Client 3" />
                                <div className="testimonial-text">
                                    <p>"I've been to over 40 countries and have used several apps to document my travels, but nothing compares to Rover. It's like a digital passport!"</p>
                                    <em>-Alejandro Verdugo</em>
                                </div>
                            </div>
                        </Carousel.Item>
                    </Carousel>
                </Container>
            </section>

            {/* guides */}
            <section id="travel-guides" className="bg-light">
                <Container fluid="lg">
                    <div className="text-center">
                        <h2 className="section-title">Travel Guide</h2>
                        <p className="lead section-subtitle">
                            Plan your next adventure with our professional and amateur travel guides!
                        </p>
                    </div>

                    {/* Guide Cards */}
                    <Row className="my-5 align-items-center justify-content-center">
                        <Col xs={12} lg={4} className="my-3">
                            <Card className="card-guide text-center">
                                <Card.Header className="guide-header">
                                    <div
                                        className="card-header-image"
                                        style={{
                                            backgroundImage: `url(${mexico_banner})`,
                                        }}
                                    ></div>
                                </Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        Explore the vibrant culture, stunning beaches, and hidden gems of Mexico. Whether you want to discover ancient ruins or enjoy delicious cuisine, this guide has it all.
                                    </Card.Text>
                                    <Button href="/guides/mexico" variant="primary">Explore Mexico</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} lg={4} className="my-3">
                            <Card className="card-guide text-center">
                                <Card.Header className="guide-header">
                                    <div
                                        className="card-header-image"
                                        style={{
                                            backgroundImage: `url(${france_banner})`,
                                        }}
                                    ></div>
                                </Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        Discover the romance, history, and culinary delights of France. From the streets of Paris to the beaches of the French Riviera, start your French adventure with our essential guide.
                                    </Card.Text>
                                    <Button href="/guides/france" variant="primary">Explore France</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} lg={4} className="my-3">
                            <Card className="card-guide text-center">
                                <Card.Header className="guide-header">
                                    <div
                                        className="card-header-image"
                                        style={{
                                            backgroundImage: `url(${japan_banner})`,
                                        }}
                                    ></div>
                                </Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        Experience the rich traditions and cutting-edge modernity of Japan. From the serene temples to bustling Tokyo streets, this guide has everything you need.
                                    </Card.Text>
                                    <Button href="/guides/japan" variant="primary">Explore Japan</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* FAQ Section */}
            <section id="faq">
                <Container fluid="lg">
                    <div className="text-center">
                        <h2 className="section-title">FAQ</h2>
                        <p className="lead section-subtitle">Want to Know More?</p>
                    </div>

                    {/* Accordion */}
                    <Accordion defaultActiveKey="0" className="my-5">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header className="faq-header">What makes Rover different from other social media platforms?</Accordion.Header>
                            <Accordion.Body>
                                Rover is designed specifically for travelers! Each user has an interactive globe on their profile where they can highlight the countries they have visited, making it a fun and personalized way to showcase your travels!
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Is Rover free to use?</Accordion.Header>
                            <Accordion.Body>Yes, Rover is completely free to join and use!</Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>What languages is Rover available in?</Accordion.Header>
                            <Accordion.Body>
                                Currently, Rover is available in English, Spanish, French, Japanese, and Italian. We plan to add more languages in the future to cater to travelers all over the world!
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="3">
                            <Accordion.Header>How do I connect with other travelers?</Accordion.Header>
                            <Accordion.Body>
                                Search for users, join groups, or participate in discussions to connect with fellow adventurers.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="4">
                            <Accordion.Header>Can I create my own travel guides?</Accordion.Header>
                            <Accordion.Body>
                                Not directly, but our travel guides are made through the recommendations of both our own experiences and those of our user's.
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Container>
            </section>
        </div>
    );
}

export default LandingPage;

