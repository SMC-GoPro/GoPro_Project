let filterTexts = [];

// 유튜브 썸네일 숨기는 함수
function hideThumbnails() {
  const videoItems = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer');
  videoItems.forEach(item => {
    const title = item.querySelector('#video-title');
    if (title && filterTexts.some(text => title.innerText.includes(text))) {
      const thumbnail = item.querySelector('ytd-thumbnail, #thumbnail');
      if (thumbnail) {
        thumbnail.style.display = 'none';
      }
    }
  });
}

// 유튜브 썸네일 복구 함수
function showThumbnails() {
  const thumbnails = document.querySelectorAll('ytd-thumbnail, #thumbnail');
  thumbnails.forEach(thumbnail => {
    thumbnail.style.display = '';
  });
}

// DOM 변화를 감지하여 동적으로 로드되는 썸네일 숨기기
const observer = new MutationObserver(() => {
  chrome.storage.local.get(['isActive'], (data) => {
    if (data.isActive) {
      hideThumbnails();
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });

// 로컬 스토리지에서 필터 텍스트 로드 및 초기화
chrome.storage.local.get(['filterTexts', 'isActive'], (data) => {
  filterTexts = data.filterTexts || [];
  if (data.isActive) {
    hideThumbnails();
  } else {
    showThumbnails();
  }
});
