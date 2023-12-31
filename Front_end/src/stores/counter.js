import { ref, computed, watch } from "vue";
import { defineStore, storeToRefs } from "pinia";
import axios from "axios";
import { useRouter } from "vue-router";

export const useCounterStore = defineStore(
  "counter",
  () => {
    const router = useRouter();
    const userInfo = ref(null);
    const token = ref(null);
    const movies = ref([]);
    const reviews = ref(null);
    // const API_URL = "";
    // const SITE_URL = "";
    // const YouTube_API_KEY = ""
    // const YouTube_URL = ""
    const isAuthenticated = ref(false);
    const genre_movies = ref([]);
    const movieIds = [5,4,3,6,7,8,9]
    const moviesURLs = ref([])

    const getVideos = function(movieId, movieTitle){
      const q_movieTitle = movieTitle+' 예고편'
      console.log(q_movieTitle)
      axios({
        method:"GET",
        url:`${YouTube_URL}?key=${YouTube_API_KEY}&part=snippet&q=${q_movieTitle}&chart=mostPopular&type=video&maxResults=1`,
      })
        .then((response)=>{
          const obj = {
            movieId,
            movieTitle,
            movieVideo : response.data.items[0].id.videoId,
            movieThumbnail : response.data.items[0].snippet.thumbnails.high.url,
          }
          moviesURLs.value.push(obj)
        })
        .catch(err=>console.log(err))
    }

    const getMovieUrls = function(){
      moviesURLs.value = []
      for (const id of movieIds) {
        for (const movie of movies.value) {
          if(movie.id === id){
            getVideos(movie.id, movie.title)
            break
          }
        }
      }
      console.log(moviesURLs.value)
    }

    const getMoviesGenre = function (genreId) {
      genre_movies.value = [];
      let count = 0;
      for (const movie of movies.value) {
        if (movie.genres.includes(genreId)) {
          genre_movies.value.push(movie);
          count++;
        }
        if (count === 8) {
          break;
        }
      }
    };

    const getUserInfo = () => {
      axios({
        method: "GET",
        url: `${API_URL}/accounts/user/`,
        headers: {
          Authorization: `Token ${token.value}`,
        },
      })
        .then((response) => {
          userInfo.value = response.data;
        })
        .catch((err) => console.log(err.response));
    };

    const getMovies = function () {
      axios({
        method: "GET",
        url: `${API_URL}/movies/`,
      })
        .then((response) => {
          movies.value = response.data
          movies.value.sort(function (movie1, movie2) {
            return movie2["popularity"] - movie1["popularity"];
          });
        })
        .then(()=>{
          getMovieUrls()
        })
        .catch((err) => console.log(err));
    };

    const popular_movies = computed(() => {
      return movies.value.slice(0, 8);
    });

    watch(token, () => {
      isAuthenticated.value = token.value === null ? false : true;
    });

    const Login = (payload) => {
      const { username, password } = payload;
      axios({
        method: "POST",
        url: `${API_URL}/dj_rest_auth/login/`,
        data: {
          username,
          password,
        },
      })
        .then((response) => {
          token.value = response.data.key;
          getUserInfo(response.data.key);
        })
        .then(() => router.push({ name: "home" }))
        .catch((err) => console.log(
          confirm('아이디/비밀번호가 틀렸습니다.')
        ));
    };

    const Signup = function (payload) {
      const {
        username,
        password1,
        password2,
        name,
        birth,
        phoneNumber,
        like_genres,
        photo,
      } = payload;
      axios({
        method: "POST",
        url: `${API_URL}/dj_rest_auth/signup/`,
        data: {
          username,
          password1,
          password2,
          name,
          birth,
          phoneNumber,
          like_genres,
          photo,
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then((response) => {
          const User = {
            username,
            password: password1,
          };
          alert("회원가입 되셨습니다.")
          Login(User);
        })
        .catch((err) => {
          const status = err.response.status

          if (status == 400) {
            const errMsgs = err.response.data
            const errField = Object.keys(errMsgs)[0]
            const errMessage = Object.values(errMsgs)[0][0]
            alert(`${errField} : ${errMessage}`)
          } else if (status == 500) {
            alert("회원가입 되셨습니다.")
            Login(User);
          }
        });
    };

    const logoutUser = function () {
      localStorage.clear();
      userInfo.value = null;
      token.value = null;
      router.replace({ name: "home" });
    };

    return {
      movies,
      getMovies,
      Signup,
      Login,
      popular_movies,
      logoutUser,
      token,
      API_URL,
      userInfo,
      getUserInfo,
      reviews,
      getMoviesGenre,
      genre_movies,
      SITE_URL,
      YouTube_API_KEY,
      moviesURLs,
    };
  },
  { persist: true }
);


