document.addEventListener('DOMContentLoaded', () => {
  const filterTextInput = document.getElementById('filterText');
  const addButton = document.getElementById('addButton');
  const toggleButton = document.getElementById('toggleButton');
  const filterList = document.getElementById('filterList');

  // 로컬 스토리지에서 데이터 로드
  chrome.storage.local.get(['filterTexts', 'isActive'], (data) => {
    const filterTexts = data.filterTexts || [];
    const isActive = data.isActive || false;

    toggleButton.textContent = isActive ? "비활성화" : "활성화";
    filterTexts.forEach(text => addFilterItem(text));
  });

  // 저장된 문자열 리스트 업데이트
  function addFilterItem(text) {
    const li = document.createElement('li');
    li.textContent = text;
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '삭제';
    deleteButton.addEventListener('click', () => {
      chrome.storage.local.get(['filterTexts'], (data) => {
        const filterTexts = data.filterTexts || [];
        const newFilterTexts = filterTexts.filter(t => t !== text);
        chrome.storage.local.set({ filterTexts: newFilterTexts }, () => {
          li.remove();
          // 새로고침 없이 썸네일 복구
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              function: () => {
                const thumbnails = document.querySelectorAll('ytd-thumbnail');
                thumbnails.forEach(thumb => {
                  thumb.style.display = '';
                });
              }
            });
          });
        });
      });
    });
    li.appendChild(deleteButton);
    filterList.appendChild(li);
  }

  // 문자열 추가 버튼 클릭 이벤트
  addButton.addEventListener('click', () => {
    const text = filterTextInput.value;
    if (text) {
      chrome.storage.local.get(['filterTexts'], (data) => {
        const filterTexts = data.filterTexts || [];
        if (!filterTexts.includes(text)) {
          filterTexts.push(text);
          chrome.storage.local.set({ filterTexts: filterTexts }, () => {
            addFilterItem(text);
            filterTextInput.value = '';
          });
        }
      });
    }
  });

  // 활성화/비활성화 버튼 클릭 이벤트
  toggleButton.addEventListener('click', () => {
    chrome.storage.local.get(['isActive', 'filterTexts'], (data) => {
      const newIsActive = !data.isActive;
      const filterTexts = data.filterTexts || [];
      chrome.storage.local.set({ isActive: newIsActive }, () => {
        toggleButton.textContent = newIsActive ? "비활성화" : "활성화";
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: (newIsActive, filterTexts) => {
              if (newIsActive) {
                filterTexts.forEach(text => {
                  document.querySelectorAll('ytd-thumbnail').forEach(thumb => {
                    if (thumb.innerText.includes(text)) {
                      thumb.style.display = 'none';
                    }
                  });
                });
              } else {
                document.querySelectorAll('ytd-thumbnail').forEach(thumb => {
                  thumb.style.display = '';
                });
              }
            },
            args: [newIsActive, filterTexts]
          });
          window.close();
        });
      });
    });
  });
});
