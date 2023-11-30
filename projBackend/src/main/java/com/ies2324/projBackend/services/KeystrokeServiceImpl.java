package com.ies2324.projBackend.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import com.ies2324.projBackend.entities.Keystroke;
import com.ies2324.projBackend.repositories.KeystrokeRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class KeystrokeServiceImpl implements KeystrokeService {

  private KeystrokeRepository keystrokeRepository;

  @Override
  public List<Keystroke> getAllKeystrokes() {
    return keystrokeRepository.findAll();
  }

  @Override
  public List<Keystroke> getKeystrokesByAuthorId(Long authorId) {
    return keystrokeRepository.findByAuthorIdOrderByTsAsc(authorId);
  }

  @Override
  public Keystroke createKeystroke(Keystroke keystroke) {
    return keystrokeRepository.save(keystroke);
  }

  @Override
  public void createKeystrokes(List<Keystroke> keystrokes) {
    keystrokeRepository.saveAll(keystrokes);
  }

}