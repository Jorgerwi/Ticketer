import React, { useEffect, useState } from 'react';
import Menylinje from '../Menylinje';
import '../../stylesheets/Posts.css';
import '../../stylesheets/ProfilePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserAstronaut } from '@fortawesome/free-solid-svg-icons';
import '../../stylesheets/ProfileInfo.css';
import Footer from '../homepage/Footer';
import Header from '../homepage/Header';
import { CardGroup, Container } from 'react-bootstrap';
import { getUserById } from '../../client/userHandler';
import { getPostsByAuthorId } from '../../client/postHandler';
import { Post } from '../../types';
import PostInfo from '../createpostpage/PostInfo';
import { useLocation } from 'react-router-dom';
import Rating from '../ProfilPage/Rating';

function UserPage() {
  const location = useLocation();

  const userId = Number.parseInt(
    location.pathname.split('/')[location.pathname.split('/').length - 1]
  );

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [userIdError, setError] = useState<boolean>(false);

  async function getUserData() {
    try {
      if (!isNaN(userId)) {
        const user = await getUserById(userId);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
      } else {
        setError(true);
      }
    } catch (error: any) {
      setError(true);
    }
  }
  const [posts, setPosts] = useState<Post[]>([]);

  let rendered = false;

  async function getUsersPosts() {
    if (!isNaN(userId)) {
      try {
        setPosts(await getPostsByAuthorId(userId));
      } catch (error: any) {
        // console.error(error);
      }
    }
  }

  useEffect(() => {
    if (!rendered) {
      getUsersPosts();
      getUserData();
      rendered = true;
    }
  }, []);

  return (
    <div>
      <Menylinje />
      <div style={{ marginLeft: '133px' }}>
        <Header />
        {userIdError ? (
          <div
            className="row h-100 flex justify-content-center align-items-center text-center"
            style={{ minHeight: '50vh' }}
          >
            <h2>Bruker ble ikke funnet</h2>
          </div>
        ) : (
          <div>
            <div className="row ms-5">
              <div className="col-3 ms-5">
                <span className="button__icon-10">
                  <FontAwesomeIcon icon={faUserAstronaut}></FontAwesomeIcon>
                </span>
              </div>
              <div className="col-4 mt-5">
                <div
                  className="p-3 rounded"
                  style={{ backgroundColor: 'rgb(100, 176, 145)' }}
                >
                  <h5 className="text-white">
                    {firstName} {lastName}
                  </h5>
                  <h5 className="text-white">{email}</h5>
                </div>
                <Rating userId={userId}/>
              </div>
            </div>
            <div className="mt-0 ml-5 mr-5 p-0">
              <Container>
                <h2 className="text-center">{firstName} sine Ticketer</h2>
                <CardGroup>
                  {posts.map((post, idx) => (
                    <PostInfo
                      key={idx}
                      createdAt={post.createdAt}
                      timeOfEvent={post.timeOfEvent}
                      city={post.city}
                      venue={post.venue}
                      isActive={post.isActive}
                      forSale={post.forSale}
                      title={post.title}
                      description={post.description}
                      category={post.category}
                      price={post.price}
                      authorId={post.authorId}
                      id={post.id}
                    />
                  ))}
                </CardGroup>
              </Container>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
}

export default UserPage;
