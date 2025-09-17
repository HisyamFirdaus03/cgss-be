var authKey = ''
$(document).ready(function () {
  let searchParams = new URLSearchParams(window.location.search)
  if (searchParams.has('key')) {
    authKey = searchParams.get('key')
    verify(authKey)
  }
})

const verify = async (key) => {
  try {
    const res = await axios.get(`/api/v1/users/verify-email`, {
      headers: {
        authorization: key,
      },
    })
    $('#status').empty()
    $('#status').append(`
      <div class="alert alert-success" role="alert">
        <strong>Success !</strong> ${res.data}.
      </div>
    `)
  } catch (e) {
    $('#status').empty()
    $('#status').append(`
      <div class="alert alert-danger" role="alert">
        <strong>Error !</strong> ${e.response.data.error.message}.
      </div>
    `)
  }
}
